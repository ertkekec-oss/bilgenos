# BİLGEN OS — PHASE 1B: CORE SECURITY & PLATFORM DESIGN GATE
## Domain Model Refinement, Lifecycle State Machine & Capability Governance
**Document ID:** `BILGENOS-CORE-GATE-1B-001`  
**Date:** 2026-09-23  
**Status:** Architecture Decision Record (ADR) & Design Gate Approved  
**Author:** SaaS Software Architect, Security Engineer & EdTech Data Architect

---

## 1. PERSON & GUARDIAN RELATIONSHIP MODELİ (TEMİZ DOMAIN AYRIMI)

Veli (`Guardian`) bir profil türü veya öğrenci tablosunda bir `guardian_id` kolonu değildir. Biyolojik veya hukuki olarak bir `Person` ile bir `Learner` arasındaki **zaman damgalı, çok boyutlu ve bağımsız bir Domain İlişkisidir (`GuardianRelationship`)**.

### 1.1. Şema Tasarımı

```sql
CREATE TABLE guardian_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    guardian_person_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
    -- İlişki Türü (Biyolojik / Sosyal)
    relationship_type VARCHAR(50) NOT NULL, -- MOTHER, FATHER, SIBLING, GRANDPARENT, FOSTER_PARENT, LEGAL_REPRESENTATIVE
    
    -- Yetki ve Sorumluluk Bayrakları (Aynı kişi olmak zorunda değildir)
    is_legal_guardian BOOLEAN NOT NULL DEFAULT FALSE,       -- Yasal vasi mi? (Sözleşme ve rıza imzalayabilir)
    is_financial_responsible BOOLEAN NOT NULL DEFAULT FALSE,-- Mali muhatap mı? (Faturalar ve taksitler bu kişiye açılır)
    is_emergency_contact BOOLEAN NOT NULL DEFAULT FALSE,    -- Acil durumda ilk aranacak kişi mi?
    is_pickup_authorized BOOLEAN NOT NULL DEFAULT FALSE,     -- Okuldan/servisten teslim alabilir mi?
    
    -- Zaman Damgalı Geçerlilik (Boşanma, vasi değişikliği, velayet davaları)
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE, -- NULL ise süresiz geçerli
    
    -- Durum ve Notlar
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, REVOKED, EXPIRED
    custody_notes TEXT, -- Hukuki velayet kararları, kısıtlamalar (KVKK hassas veri)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_guardian_learner_period UNIQUE (guardian_person_id, learner_id, valid_from)
);
```

### 1.2. Çözülen Kritik Senaryolar:
1. **Anne ve Babanın Boşanması:** Çocuğun yasal velayeti annededir (`is_legal_guardian = true`), ancak taksitleri baba ödemektedir (`is_financial_responsible = true`). Çocuk okuldan servis ile dedesine teslim edilebilir (`is_pickup_authorized = true`). Bu üç kişi birbirinden bağımsız olarak sisteme tanımlanır.
2. **Tarihsel İhbar (Historical Audit):** Velayet mahkeme kararıyla babadan anneye geçtiğinde eski kayıt silinmez; `valid_until` tarihi işlenerek kapatılır ve yeni ilişki kaydı oluşturulur.

---

## 2. CONTEXT TABLE EXPLOSION ÖNLEME PRENSİBİ (YALIN SPECIALIZATION)

Her eğitim türü için körü körüne `XYZContext` tablosu açmak veritabanını spagettiye çevirir (Table Explosion Anti-pattern). 

### Karar Prensibi:
> **"Bir bağlam (context), yalnızca kendine ait kalıcı, ilişkisel ve bağımsız domain verisine sahipse ayrı tabloya dönüştürülür. Aksi halde `Enrollment + Program + Capability + JSONB Settings` ile çözülür."**

* **`AdultLearnerContext` ➔ YASAK (Gereksiz):** Kişinin yetişkin olduğu `Person.birth_date` üzerinden hesaplanır. Reşit olduğu için veli zorunluluğu `GuardianRelationship` tablosunun boş kalmasıyla doğal olarak karşılanır.
* **`WorkshopLearnerContext` ➔ YASAK (Gereksiz):** Workshop katılımı yalnızca `Enrollment.program_id` ve `Enrollment.cohort_id` ile eksiksiz ifade edilir.
* **`ExamPreparationProfile` ➔ ONAYLANDI (Ayrı Domain Tablosu):** Sınav hazırlık merkezlerinde öğrencinin hedef puanı, hedeflediği üniversite/bölüm, baz neti gibi K12'de karşılığı olmayan ve analitik motorunun beslendiği kalıcı alanlar vardır:

```sql
CREATE TABLE learner_exam_prep_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    target_exam VARCHAR(50) NOT NULL, -- YKS_SAY, YKS_EA, LGS, DGS, KPSS, TOEFL
    target_score DECIMAL(6,2),
    target_ranking INT,
    baseline_score DECIMAL(6,2),
    target_institution_text VARCHAR(255), -- "ODTÜ Bilgisayar Mühendisliği"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. ENROLLMENT AGGREGATE ROOT & LIFECYCLE STATE MACHINE

`Enrollment`, öğrencinin bir eğitim kurumundaki somut taahhüdünü ve varlığını yöneten **Aggregate Root**'tur.

### 3.1. Varlık Tanımı (Entity Schema)
```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES organizations(id),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    campus_id UUID REFERENCES campuses(id), -- NULLABLE
    period_id UUID REFERENCES education_periods(id), -- NULLABLE (Dönemsiz eğitimler için)
    program_id UUID NOT NULL REFERENCES education_programs(id),
    level_id UUID REFERENCES education_levels(id), -- NULLABLE
    cohort_id UUID REFERENCES education_cohorts(id), -- NULLABLE (Birebir özel dersler için)
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE RESTRICT,
    
    enrollment_number VARCHAR(64),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    
    start_date DATE NOT NULL,
    expected_end_date DATE,
    actual_end_date DATE,
    
    cancellation_reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2. Durum Makinesi (State Machine) & Geçiş Kuralları

```
       ┌───────────┐
       │   DRAFT   │ ◄─── Ön kayıt / Teklif aşaması
       └─────┬─────┘
             │ submit_for_approval()
             ▼
       ┌───────────┐
 ┌────►│  PENDING  │ ◄─── Sözleşme ve ödeme onayı bekleniyor
 │     └─────┬─────┘
 │           │ activate() [Ödeme/Sözleşme tamamlandı]
 │           ▼
 │     ┌───────────┐
 │     │  ACTIVE   │ ◄─── Eğitime devam ediyor
 │     └─────┬─────┘
 │           │
 │   ┌───────┼───────────────────────────────┐
 │   │       │                               │
 │   │ suspend()                             │
 │   ▼       │                               │
 │ ┌───────────┐                             │
 │ │ SUSPENDED │                             │
 │ └─────┬─────┘                             │
 │       │ resume()                          │
 │       └───────────────────────────────────┤
 │                                           │
 │ complete()                  withdraw()    │ cancel()
 ▼ [Dönem bitti / mezun]      [Kendi isteği] │ [Sözleşme iptal]
┌───────────┐               ┌───────────┐   ┌───────────┐
│ COMPLETED │               │ WITHDRAWN │   │ CANCELLED │
└───────────┘               └───────────┘   └───────────┘
```

#### Durum Geçiş (Transition) Kuralları:
1. `DRAFT -> PENDING`: Yalnızca gerekli zorunlu alanlar (`learner_id`, `program_id`, `start_date`) eksiksizse tetiklenebilir.
2. `PENDING -> ACTIVE`: Eğer kurumda `FINANCE` capability'si açıksa, en az bir imzalı sözleşme veya onaylı ödeme planı bağlanmadan `ACTIVE` durumuna geçilemez.
3. `ACTIVE -> COMPLETED`: Program bitiş tarihi geldiğinde ve varsa akademik yeterlilik şartları sağlandığında geçer.
4. **Geçiş Yasağı (`COMPLETED -> ACTIVE`):** Tamamlanmış bir kayıt doğrudan `ACTIVE` durumuna alınamaz. Öğrenci aynı veya yeni bir programa devam edecekse **yeni bir `Enrollment`** kaydı açılır (Tarihsel bütünlük korunur).
5. `ACTIVE -> SUSPENDED`: Sağlık veya dondurma talebiyle geçici askıya alma. Askıdayken yoklama listelerine dahil edilmez. `resume()` ile tekrar `ACTIVE` olur.

---

## 4. COHORT'UN OPSİYONEL OLMASI (BİREBİR VE ETÜT DESTEĞİ)

Sisteme "Ahmet Özel Grup" gibi yapay ve yanıltıcı kukla (`dummy`) kohortlar eklenmesi **kesinlikle yasaklanmıştır**.

* `cohort_id` kolonu **`NULLABLE`** yapılmıştır.
* **Birebir Özel Ders Senaryosu:**
  - `Enrollment.program_id = "Özel Matematik Dersi (20 Saat)"`
  - `Enrollment.cohort_id = NULL`
  - Seanslar, doğrudan `Schedule Engine` ve `SessionBooking` aggregate'i üzerinden `learner_id` ve `educator_id` ile birebir eşleştirilir.
* **Sonuç:** K12 şubesi olan öğrenci ile bireysel ders alan öğrenci aynı temiz tabloda, gereksiz kayıt şişmesi olmadan yaşar.

---

## 5. DÖNEM SEMANTİĞİ VE ADR: `EducationPeriod`

### Architecture Decision Record (ADR-003):
* **Alternatifler:** `AcademicPeriod`, `EducationPeriod`, `OperatingPeriod`, `ProgramPeriod`.
* **Seçilen Terim:** **`EducationPeriod`**
* **Gerekçe:**
  - `AcademicPeriod`: K-12 ve üniversitelerde doğaldır ancak sınav dershaneleri, dans kursları veya kurumsal akademiler için aşırı "akademik/formal" kalmaktadır.
  - `OperatingPeriod`: Fazla teknik ve operasyoneldir; eğitimin pedagojik doğasını yansıtmaz.
  - `EducationPeriod`: Hem 9 aylık K-12 eğitim yılını (`2026-2027 Academic Year`), hem dershanenin 10 aylık sınav maratonunu (`2026-2027 YKS Sezonu`), hem de dil okulunun 3 aylık kur dönemini (`2026 Sonbahar Kuru`) kapsayan en üst şemsiye terimdir. Dönemsiz eğitimlerde `period_id = NULL` olarak bırakılır.

---

## 6. GÜVENLİK VE ERİŞİM KATMANLARI (KESİN AYRIM)

Aşağıdaki 5 kavram birbiriyle karıştırılamaz ve aynı katmanda uygulanamaz:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. SUBSCRIPTION PLAN (Ticari Paket - Örn: "Bilgen Enterprise")         │
│    Tenant'ın satın aldığı ticari paket ve kaynak limitleri.             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Tanımlar
┌───────────────────────────────────▼────────────────────────────────────┐
│ 2. ENTITLEMENT (Sözleşmesel Hak Ediş - Örn: "ASSESSMENT = ALLOWED")    │
│    Tenant'ın bu pakette hangi ana yetenekleri kullanmaya hakkı var?   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Aktif Eder
┌───────────────────────────────────▼────────────────────────────────────┐
│ 3. INSTITUTION CAPABILITY (Kurum Yeteneği - Örn: "ASSESSMENT = ON")    │
│    İlgili kurum bu yeteneği kendi bünyesinde açtı mı?                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Filtreler
┌───────────────────────────────────▼────────────────────────────────────┐
│ 4. USER PERMISSION (Rol/Kullanıcı Yetkisi - "assessment.publish")      │
│    Giriş yapan kullanıcının bu işlem için rolü ve yetki kapsamı var mı?│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Kontrol Eder
┌───────────────────────────────────▼────────────────────────────────────┐
│ 5. FEATURE FLAG (Mühendislik Bayrağı - "new_assessment_ui = 20%")      │
│    Yeni bir kodun kademeli yayılımı veya A/B testi için geçici bayrak. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. CAPABILITY DEPENDENCY GRAPH (DAG MİMARİSİ)

Yetenekler rastgele açılamaz; mantıksal bağımlılıkları vardır. Bağımlılık döngüleri (`Cycle: A -> B -> A`) kesinlikle engellenmelidir.

### 7.1. Bağımlılık Matrisi
```
QUESTION_BANK ───────► ASSESSMENT ───────► EXAM_PREP
                             ▲
                             │
CURRICULUM ──────────────────┴───────────► ACADEMIC_RISK

TRANSPORTATION ──────► TRANSPORTATION_TRACKING (Live GPS)

FINANCE ─────────────► ENROLLMENT_CONTRACTS
```

### 7.2. Doğrulama Algoritması (Cycle Detection & Topolojik Sıralama)
Kurum yöneticisi veya platform yöneticisi bir yeteneği açmak/kapatmak istediğinde **Kahn Algoritması / DFS Derinlik Taraması** ile döngü kontrolü yapılır:

```typescript
// Capability Dependency DAG Validator
export class CapabilityDependencyEngine {
  private dependencies: Map<CapabilityKey, CapabilityKey[]> = new Map([
    ['ASSESSMENT', ['CURRICULUM']],
    ['QUESTION_BANK', ['ASSESSMENT']],
    ['EXAM_PREP', ['ASSESSMENT', 'QUESTION_BANK']],
    ['TRANSPORT_TRACKING', ['TRANSPORTATION']],
    ['ACADEMIC_RISK', ['ASSESSMENT', 'ATTENDANCE']],
  ]);

  validateActivation(currentActive: Set<CapabilityKey>, target: CapabilityKey): void {
    const required = this.dependencies.get(target) || [];
    for (const req of required) {
      if (!currentActive.has(req)) {
        throw new InvariantViolationException(
          `Cannot enable capability '${target}'. Prerequisite '${req}' is not enabled.`
        );
      }
    }
  }
}
```

---

## 8. CAPABILITY DISABLE SEMANTICS (VERİ SİLME YASAĞI)

Bir kurum herhangi bir yeteneği (örneğin mali sıkıntı nedeniyle `TRANSPORTATION` veya `ASSESSMENT` yeteneğini) kapattığında:

### KESİNLİKLE YASAK OLANLAR (ANTI-PATTERNS):
❌ `DELETE FROM transport_routes WHERE institution_id = ...` (ASLA veri silinmez!)  
❌ İlişkili tabloları temizlemek (Hard Delete veya Destructive Migration).

### ZORUNLU PROTOKOL:
1. **Veri Dondurma (Data Freezing / Cold Retention):** Tüm veriler veritabanında olduğu gibi korunur.
2. **API Katmanı Koruması:** İlgili domain endpoint'leri çağrıldığında `HTTP 403 Forbidden` (`code: CAPABILITY_SUSPENDED_OR_DISABLED`) yanıtı döner.
3. **Arayüz (UI) İzolasyonu:** Navigasyon menüsünden ve dashboard kartlarından ilgili modül dinamik olarak kaldırılır.
4. **Arka Plan İşleri (Background Jobs):** İlgili capability'e ait cron veya queue worker'ları (örneğin günlük servis GPS raporu veya geciken taksit faizi hesaplama) o kurum için yürütülmeyi atlar (`skip`).
5. **Geri Açma (Re-enablement):** Kurum yeteneği yeniden açtığında, tüm geçmiş kayıtlar, güzergahlar, sorular ve sözleşmeler hiçbir veri kaybı olmadan anında kaldığı yerden canlanır.

---

## STATUS: PHASE 1B ARCHITECTURE CONFIRMED

Phase 1B kararları eksiksiz tamamlanmış, `GuardianRelationship`, `Enrollment Aggregate`, `EducationPeriod` ADR ve `Capability DAG` yönetimi kesin kurallara bağlanmıştır.

```text
STATUS: READY FOR TECH STACK & SCAFFOLDING GATE
```
