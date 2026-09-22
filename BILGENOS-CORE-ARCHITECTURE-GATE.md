# BİLGEN OS — PHASE 1: CORE ARCHITECTURE DESIGN GATE
## Domain Model Deep-Dive & Education Structure Validation
**Document ID:** `BILGENOS-CORE-GATE-001`  
**Date:** 2026-09-23  
**Status:** In Review / Design Gate Active  
**Author:** SaaS Software Architect & EdTech Domain Architect

---

## 1. DOMAIN MODEL DERİN ANALİZİ: PERSON, IDENTITY & ROLE SPECIALIZATION

### 1.1. Temel Felsefe: Kimlik (Identity) vs. Birey (Person) vs. Domain Rolleri (Profiles)

Geleneksel eğitim yazılımlarının en büyük mimari hatası; `Student` (Öğrenci), `Teacher` (Öğretmen) ve `Parent` (Veli) kavramlarını bağımsız kimlikler veya tek bir `User` tablosunun enum alanları olarak tasarlamaktır.

BilgenOS'ta bu ayrım üç net katmana ayrılmıştır:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION IDENTITY                         │
│ User (Auth Account: Email/Phone, Credentials, Sessions, MFA)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1:1
┌───────────────────────────────────▼────────────────────────────────────┐
│                             PARTY / PERSON                             │
│ Person (Biyolojik Gerçek Kişi: TC/Pasaport, Ad, Soyad, Doğum T., PII)  │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
     ┌──────────────┴──────────────┐  ┌──────────────┴──────────────┐
     ▼                             ▼  ▼                             ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│LearnerProfile│             │GuardianProfil│             │EducatorProfil│
│(Öğrenen)     │             │(Veli/Vasi)   │             │(Eğitmen)     │
└──────┬───────┘             └──────────────┘             └──────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│                     ENROLLMENT                         │
│ Aktif Eğitim Bağlamı (Kurum, Kampüs, Dönem, Kohort)     │
└───────────────────┬────────────────────────────────────┘
                    │
     ┌──────────────┴──────────────┐
     ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     K12StudentContext     │ │   AdultLearnerContext     │
│ (Veli Zorunlu, MEB No,    │ │ (Bireysel Ödeme, Veli Yok,│
│  Karne, Gelişim Raporu)   │ │  Sertifika & Kariyer Odak)│
└───────────────────────────┘ └───────────────────────────┘
```

---

### 1.2. "Learner" vs. "Student" Ayrımı: Neden Genelleştirme + Bağlamsal Özelleştirme Şart?

"Her `Student` bir `Learner`dır; ancak her `Learner` bir `Student` değildir."

* **K12 Öğrencisi (`K12StudentContext`):**
  - Hukuken reşit değildir (Minor). Sözleşme imzalayamaz.
  - Zorunlu olarak en az bir **Yasal Vasiye (`Guardian`)** bağlıdır.
  - MEB/E-Okul numarası, şube numarası, rehberlik (PDR) takibi ve karne gereksinimi vardır.
  - Mali sorumlusu kendisi değil, velisidir.

* **Dershane / Sınav Merkezi Öğrencisi (`ExamPrepContext`):**
  - Ya 12. sınıf öğrencisi ya da mezun (yetişkin) bir bireydir.
  - Veli bildirimi opsiyonel veya zorunlu olabilir.
  - Temel motivasyonu müfredat geçmek değil; **Deneme Sınavı Netleri, Hedef Puan/Sıralama ve Soru Çözüm Analitiğidir**.

* **Yetişkin Kursiyer / Dil Okulu Öğrencisi (`AdultLearnerContext`):**
  - Reşittir. Sözleşmeyi bizzat kendisi imzalar ve ödemeyi kendisi yapar (`Payer = Self`).
  - Kesinlikle bir veli (`Guardian`) kaydı gerekmez; veli arayüzü bu kurumlarda kapalıdır.
  - Temel odak: Seviye tespiti (CEFR: A1, B2), devam oranı ve bitirme sertifikasıdır (`Certificate`).

* **Kurumsal Eğitim Katılımcısı (`CorporateTraineeContext`):**
  - Bireysel sözleşmesi yoktur. Kurumsal bir şirket (`CorporateCustomer / Sponsor`) tarafından toplu olarak eğitime atanmıştır.
  - Faturalandırma şirkete yapılır, devam ve başarı raporları şirket İK departmanına raporlanır.

#### Mimari Karar:
Çekirdekte **`Learner`** tekildir ve kurum bağımsız öğrenen kimliğini temsil eder. 
Öğrencinin K-12, kursiyer veya kurumsal katılımcı olması durumu `Learner` tablosunu şişirerek değil; **`Enrollment` (Kayıt)** seviyesinde bağlanan **`EducationContext`** üzerinden polimorfik/bileşik (compositional) olarak yönetilir.

---

## 2. EDUCATION STRUCTURE ENGINE: ESNEK HİYERARŞİ DOĞRULAMASI

### 2.1. Sabit 4'lü Zincir Neden Yıkılır?

Önerilen `AcademicPeriod -> EducationProgram -> EducationLevel -> EducationCohort` zinciri katı bir foreign-key bağı olursa şu senaryolarda kilitlenir:
1. **2 Günlük Kurumsal Siber Güvenlik Çalıştayı:** Ne bir "Akademik Yıl"ı vardır, ne de "Sınıf Seviyesi (Level)". Sadece program ve tek bir oturum/grup vardır.
2. **Sürekli Kayıt Alan Dil Kursu (Continuous Rolling Enrollment):** Yıllık akademik takvim yoktur; her ayın ilk pazartesi günü yeni bir kohort (grup) başlar.
3. **Özel Birebir Ders / Etüt:** Sınıf/şube (`Cohort`) yoktur; tek bir öğrenci-öğretmen-ders eşleşmesi vardır.

---

### 2.2. Çözüm: "Esnek Düğüm ve Hiyerarşik Yapı Modeli" (Hierarchical Structural Model)

Aşırı generic EAV tuzağına düşmeden, güçlü tip güvenliğini koruyan **Composite Structure Engine** mimarisi:

```
                            ┌────────────────────────┐
                            │      INSTITUTION       │
                            └───────────┬────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
             ┌───────────────────────┐     ┌───────────────────────┐
             │    ACADEMIC PERIOD    │     │   EDUCATION PROGRAM   │
             │ (Yıl, Sezon, Dönem,   │     │ (K12 Lise, YKS Sayısal│
             │  Rolling - Opsiyonel) │     │  Genel İngilizce vb.) │
             └───────────┬───────────┘     └───────────┬───────────┘
                         │                             │
                         └──────────────┬──────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │       EDUCATION LEVEL       │
                         │ (Sınıf, Seviye, Modül, Kur) │
                         │    [OPSİYONEL - Nullable]   │
                         └──────────────┬──────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │       EDUCATION COHORT      │
                         │ (Şube, Grup, Etüt, Sınıf)   │
                         └─────────────────────────────┘
```

### 2.3. Senaryo Doğrulamaları (Senaryo Testleri)

#### Senaryo 1: K-12 Koleji (Tam Hiyerarşi)
* **Academic Period:** `2026-2027 Eğitim Öğretim Yılı` (Tarih: 01.09.2026 - 20.06.2027)
* **Program:** `Fen Lisesi Müfredatı`
* **Level:** `10. Sınıf` (Order: 10)
* **Cohort:** `10-Fen-A` (Kapasite: 24, Sınıf Öğretmeni: Ayşe Yılmaz, Derslik: B-201)
* **Sonuç:** Model tam oturur.

#### Senaryo 2: YKS / LGS Dershanesi (Seviye = Hedef Grup)
* **Academic Period:** `2026-2027 YKS Hazırlık Sezonu`
* **Program:** `YKS Sayısal VIP Hazırlık`
* **Level:** `Mezun Seviyesi` (veya 12. Sınıf Seviyesi)
* **Cohort:** `Hafta Sonu Sayısal-1 Grubu` (Ders Günleri: Cumartesi-Pazar, Rehber Öğretmen: Mehmet Demir)
* **Sonuç:** Model esnekliği sayesinde K12 sınıfı gibi değil, sınav odaklı grup olarak sorunsuz çalışır.

#### Senaryo 3: Dil Okulu (Rolling Cohorts / Kurlar)
* **Academic Period:** `2026 Sonbahar Dönemi` (veya `Rolling - Dönemsiz`)
* **Program:** `Yetişkin Genel İngilizce`
* **Level:** `B1 - Intermediate` (CEFR standardı)
* **Cohort:** `Ekim 2026 Akşam B1-A` (Haftada 3 gün, 19:00 - 21:30)
* **Sonuç:** Level burada "Sınıf" değil "Dil Kuru"dur. Dönem olmasa dahi kohort başlangıç ve bitiş tarihiyle bağımsız çalışabilir.

#### Senaryo 4: Kısa Süreli Atölye / Kurumsal Eğitim (Levelsız Yapı)
* **Academic Period:** *NULL* (Dönemsiz)
* **Program:** `Python ile Veri Analitiği Workshop (16 Saat)`
* **Level:** *NULL* (Seviye ayrımı yok, doğrudan tek müfredat)
* **Cohort:** `Grup 2026-11` (Başlangıç: 15 Kasım, Bitiş: 16 Kasım)
* **Sonuç:** `Level` alanı `nullable` olduğu için sistem zorlama ara katmanlar yaratmaz. Program doğrudan Kohort'a bağlanır.

---

## 3. CORE VERİ TABANI ŞEMASI (DDL & PRISMA/EF ÇEKİRDEĞİ)

```sql
-- 1. Birey (Merkezi İnsan Kaydı)
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id VARCHAR(64) UNIQUE, -- Uygulama katmanında şifreli (AES-256)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender VARCHAR(20),
    blood_type VARCHAR(10),
    emergency_phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sistem Kullanıcısı (Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kurum Yetenekleri (Capability Matrix)
CREATE TABLE institution_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    capability_key VARCHAR(50) NOT NULL, -- ACADEMIC, FINANCE, ATTENDANCE, EXAM_PREP, CRM, TRANSPORT, CAFETERIA, GUIDANCE, AI
    is_enabled BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}', -- Capability'e özel konfigürasyon (Örn: devamsızlık toleransı, kuruş hassasiyeti vb.)
    UNIQUE (institution_id, capability_key)
);

-- 4. Esnek Eğitim Yapısı (Programs & Cohorts)
CREATE TABLE education_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    structure_type VARCHAR(50) NOT NULL, -- K12, EXAM_PREP, LANGUAGE, VOCATIONAL, WORKSHOP
    has_levels BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE education_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES education_programs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "10. Sınıf", "B1 Seviyesi", "Mezun Sayısal"
    order_index INT NOT NULL
);

CREATE TABLE education_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id),
    program_id UUID NOT NULL REFERENCES education_programs(id),
    level_id UUID REFERENCES education_levels(id), -- NULLABLE (Workshop veya levelsız programlar için)
    academic_period_id UUID REFERENCES academic_periods(id), -- NULLABLE (Dönemsiz eğitimler için)
    name VARCHAR(100) NOT NULL, -- "10-A", "YKS-Haftasonu-1", "Akşam B1"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    capacity INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Öğrenen ve Kayıt Bağlamı
CREATE TABLE learners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    learner_number VARCHAR(50),
    learner_type VARCHAR(50) NOT NULL, -- K12_STUDENT, EXAM_PREP_STUDENT, ADULT_TRAINEE, CORPORATE_PARTICIPANT
    current_status VARCHAR(50) NOT NULL, -- ACTIVE, COMPLETED, SUSPENDED, DROPPED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (institution_id, learner_number)
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE RESTRICT,
    cohort_id UUID NOT NULL REFERENCES education_cohorts(id) ON DELETE RESTRICT,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL, -- ACTIVE, TRANSFERRED, COMPLETED, CANCELLED
    context_data JSONB DEFAULT '{}', -- K12'ye özel okul no, servis/yemek seçimleri veya kurumsal sponsor bilgisi
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. İNCELEME VE ONAY İÇİN AÇIK SORULAR (ARCHITECTURAL CHECKLIST)

1. **Reşit Olmayan Bireyler İçin Sözleşme İmzacı Modeli:**
   K12 ve lise hazırlıkta sözleşmeyi `Guardian` imzalar. Kursiyer yetişkin ise sözleşmeyi `Person (Learner)` imzalar. `EnrollmentContract` tablosunda `payer_person_id` kullanılması her iki senaryoyu da çözer mi? *(Cevap: Evet, Payer doğrudan `Person` modeline bağlıdır, böylece öğrencinin kendisi de, velisi de, şirket sponsoru da Payer olabilir).*
2. **Bir Öğrencinin Aynı Kurumda Birden Fazla Eğitime Kaydı:**
   Örn: Bir öğrenci gündüz K12 lisesinde okurken, hafta sonu aynı kurumun YKS etüt kursuna veya robotik kulübüne kayıtlı olabilir mi?
   *(Cevap: Evet, `Learner` birden fazla `Enrollment` kaydına sahip olabilir; her enrollment ayrı bir `Cohort`a işaret eder).*

---

## STATUS: DESIGN GATE REVIEW

Bu tasarım, BilgenOS çekirdeğini hiçbir kuruma kilitlenmeden ama her kurumun ruhuna tam oturacak şekilde yapılandırmıştır. 

```text
STATUS: READY FOR ARCHITECTURAL CONFIRMATION
```
