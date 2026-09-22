# BİLGEN OS — EDUCATION OPERATING SYSTEM
## Master Architecture, Domain Discovery & Capability Blueprint — V2
**Document ID:** `BILGENOS-DOMAIN-DISCOVERY-V2-001`  
**Date:** 2026-09-23  
**Role Context:** SaaS Software Architect, EdTech Specialist, DDD Architect, Security & AI Systems Architect  
**Project Workspace:** `bilgenerp` (Greenfield / Temiz Çalışma Alanı)

---

## 1. MEVCUT MİMARİ HARİTASI (CURRENT ARCHITECTURE MAP)

* **Repository Durumu:** `c:\Users\ertke\Desktop\bilgenerp` dizini incelenmiştir. Kod tabanı tamamen temiz (greenfield) olup herhangi bir runtime, framework, ORM veya harici kütüphane henüz bağlanmamıştır.
* **Bağımlılık Durumu:** Sıfır teknik borç, sıfır kilitli bağımlılık.
* **Mevcut Altyapı Notu:** Greenfield olması, V2 ile getirilen **Institution + Capability + Configuration** mimarisini ve DDD (Domain-Driven Design) katmanlarını geriye dönük migration sancısı yaşamadan, en temiz haliyle inşa etme imkânı sunmaktadır.

---

## 2. MEVCUT VARLIK ENVANTERİ (ENTITY INVENTORY)

* Mevcut projede tanımlı legacy bir entity bulunmamaktadır.
* **Hedef Çekirdek Varlıklar (V2 Education Core):**
  - Tenancy: `Platform`, `Organization`, `Institution`, `Campus`, `AcademicPeriod`.
  - Capability & Config: `InstitutionType`, `InstitutionCapability`, `InstitutionConfiguration`.
  - Identity & Party: `Person`, `User`, `Role`, `Permission`, `Scope`, `UserRoleAssignment`.
  - Education Structure: `EducationStructureType`, `EducationProgram`, `EducationLevel`, `EducationCohort` (ClassSection / Group / Batch).
  - Learner: `Learner`, `Guardian`, `Educator`, `Employee`, `Enrollment`, `LearnerJourneyState`.
  - Academic & Course: `Curriculum`, `CoursePackage`, `Course`, `Unit`, `Topic`, `LearningOutcome`, `LessonSession`.
  - Assessment: `QuestionBank`, `Question`, `ExamDefinition`, `ExamInstance`, `ExamResult`, `OutcomeAssessment`.
  - Operations & Finance: `Contract`, `PriceItem`, `DiscountRule`, `Installment`, `Payment`, `AttendanceSession`, `TransportationRoute`, `MealPlan`.

---

## 3 & 4. YENİDEN KULLANILABİLİR BİLEŞENLER VE SERVİSLER (REUSABLE COMPONENTS & SERVICES)

Greenfield bir sistem inşa edildiğinden, aşağıdaki temel çekirdek servisler baştan modüler kütüphaneler (shared kernel) olarak tasarlanacaktır:
* **Capability Guard Service:** İstek yapılan kurumun ilgili yeteneğe (`Capability`) sahip olup olmadığını kontrol eden middleware.
* **Tenant & Scope Resolver:** Her HTTP isteğinde veya event işlemede `TenantId`, `InstitutionId`, `CampusId` hiyerarşisini çözümleyen ve veri sorgularına enjekte eden güvenlik servisi.
* **Idempotent Event Publisher & Outbox Processor:** Veritabanı commit'i ile event fırlatma işlemini atomik bağlayan Outbox mekanizması.
* **Money & Calculation Engine:** `DECIMAL(18,4)` veya en küçük para birimi (kuruş bazlı integer) ile çalışan, yuvarlama farkı üretmeyen finansal motor.
* **Audit & Compliance Interceptor:** Tüm CRUD işlemlerinde actor, scope, IP, user-agent ve delta (eski-yeni fark) kaydı tutan immutable logger.

---

## 5 & 6. DOMAIN VE İSİMLENDİRME ÇAKIŞMALARI (COLLISION ANALYSIS)

Eğitim sektöründeki geleneksel yazılımların düştüğü en büyük tuzaklar ve V2'deki çözüm yaklaşımları:

| Kritik Çakışma / Tuzak | Klasik Hata | BilgenOS V2 Çözümü |
| :--- | :--- | :--- |
| **School Merkezli Tasarım** | Sisteme `School`, `SchoolType`, `GradeYear` gibi K12'ye kilitli isimler vermek; dershane veya dil kursu geldiğinde `if (school.type == "KURS")` gibi spagetti kodlara yol açar. | **Institution Merkezli Tasarım:** Çekirdekte `Institution` yer alır. K12 okulu, dershane, dil kursu ve müzik akademisi bu kurumun birer `InstitutionType` tanımıdır. |
| **K12 Yapısını Herkese Zorlamak** | Kurs merkezindeki 3 aylık A1 İngilizce grubuna K12'deki "1. Dönem 9-A Sınıfı" kavramını zorlamak. | **Education Structure Engine:** Ortak soyutlama (`Program -> Level/Module -> Cohort/Section`). Özel okul sınıfı da, dershane YKS etüt grubu da, dil okulu kuru da aynı yapısal motorda modellenir. |
| **User = Person = Role Karışıklığı** | Bir kişinin kimliği (`User`) ile biyolojik şahsını (`Person`) ve domain rollerini (`Educator`, `Guardian`, `Learner`) birleştirmek. | **Party-Role Modeli:** Birey tektir (`Person`). Bir birey bir kurumda eğitmen (`Educator`), diğer kurumda veli (`Guardian`), hafta sonu kursunda ise öğrenci (`Learner`) olabilir. |
| **İndirim (Discount) ile Burs (Scholarship) Eşitlenmesi** | Muhasebe açısından burs ile ticari kampanya indiriminin aynı kabul edilmesi. | **Ayrı Domainler:** İndirim ticari/pazarlama kuralıdır; burs ise başarı, sosyal durum veya sözleşmeye bağlı bir mali tahsistir. Muhasebe ve vergi yansımaları farklıdır. |
| **EAV (Entity-Attribute-Value) Cehennemi** | Kurumları esnek yapacağım diye tüm veritabanını `AttributeKey`, `AttributeValue` şeklinde NoSQL/EAV karmaşasına çevirip ilişkisel bütünlüğü ve sorgu performansını kaybetmek. | **Typed Specialization + JSONB Configuration:** Çekirdek ilişkisel tablolar kesin tipli (strongly-typed) kalır; kuruma ve capability'e özel dinamik alanlar JSONB şemaları ve runtime validasyonları ile korunur. |

---

## 7, 8 & 9. RİSK RAPORU (SECURITY, PRIVACY & MIGRATION RISKS)

1. **Çocuk Verileri ve Hassas PII (KVKK / GDPR / FERPA):**
   - 18 yaş altı öğrencilerin verileri, sağlık kayıtları (alerji, engellilik durumu vb.) ve rehberlik (PDR) görüşme notları **Özel Nitelikli Kişisel Veri** statüsündedir.
   - *Önlem:* Rehberlik ve sağlık verileri standart öğretmen ve personel tablolarından ayrı tutulur, veritabanında kolon seviyesinde şifrelenir (AES-256) ve bu verilere erişim her defasında immutable audit log'a kaydedilir.
2. **Multi-Tenant Veri Sızıntısı Riski:**
   - Çok kiracılı SaaS'larda en ölümcül hata bir kurumun öğrencilerinin başka bir kuruma listelenmesidir.
   - *Önlem:* Tenant/Institution/Campus izolasyonu doğrudan backend veri erişim katmanında (PostgreSQL Row-Level Security veya global query context) zorunlu kılınacak, asla frontend filtrelerine güvenilmeyecektir.
3. **Mali Mutabakat ve Parasal Hassasiyet:**
   - Kuruş yuvarlama hataları ve kayıtsız sözleşme iptalleri kurumu mali incelemelerde yakar.
   - *Önlem:* Finans tablolarında `FLOAT` veya `DOUBLE` tipi yasaktır; `BIGINT (cents)` veya `DECIMAL(18,4)` kullanılacaktır. İmzalı sözleşmeler hard-delete yapılamaz.
4. **AI İzolasyon ve Yetki Aşımı (Privilege Escalation via AI):**
   - AI'a doğrudan veritabanı bağlantısı verilirse prompt injection ile yetkisiz veriler sızabilir.
   - *Önlem:* Bilgen AI bir SQL çalıştırıcısı değildir; kullanıcının mevcut JWT token'ı ve yetkileriyle sınırlı API/Tool katmanını çağıran bir zekâ arayüzüdür.

---

## 10. PROPOSED BOUNDED CONTEXTS (SINIRLARI ÇİZİLMİŞ ALANLAR)

```
                                  ┌───────────────────────────────┐
                                  │       BİLGEN OS PLATFORM      │
                                  │ Organization & Tenant Manager │
                                  └───────────────┬───────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
      ┌───────────────────────┐                                         ┌───────────────────────┐
      │   INSTITUTION CORE    │                                         │     IDENTITY CORE     │
      │ • Institution Registry│                                         │ • Person Registry     │
      │ • Campus / Branch     │                                         │ • User Authentication │
      │ • Capability Engine   │                                         │ • Scope-Aware RBAC    │
      │ • Config Engine       │                                         │ • Profile & Contacts  │
      └──────────┬────────────┘                                         └───────────┬───────────┘
                 │                                                                  │
                 └────────────────────────────────┬─────────────────────────────────┘
                                                  ▼
      ┌─────────────────────────────────────────────────────────────────────────────────────────┐
      │                                    OPERATIONAL DOMAINS                                  │
      │                                                                                         │
      │  ┌────────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────┐  │
      │  │      CRM & LEADS       │  │    STRUCTURE ENGINE    │  │       FINANCE OS          │  │
      │  │ • Lead & Opportunity   │  │ • Period / Season      │  │ • Price Book & Catalog    │  │
      │  │ • Trial Exam / Lesson  │  │ • Program / Level      │  │ • Contracts & Signatures  │  │
      │  │ • Conversion Funnel    │  │ • Cohort / Classroom   │  │ • Installments & Cashier  │  │
      │  └────────────────────────┘  └────────────────────────┘  └───────────────────────────┘  │
      │                                                                                         │
      │  ┌────────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────┐  │
      │  │      ACADEMIC OS       │  │   ASSESSMENT ENGINE    │  │    ATTENDANCE ENGINE      │  │
      │  │ • Curriculum & Syllabi │  │ • Question Bank (Tags) │  │ • Session / Daily Check   │  │
      │  │ • Courses & Packages   │  │ • Configurable Exams   │  │ • Excuses & Tardiness     │  │
      │  │ • Learning Outcomes    │  │ • Outcome Analytics    │  │ • Parent Real-time Alert  │  │
      │  └────────────────────────┘  └────────────────────────┘  └───────────────────────────┘  │
      │                                                                                         │
      │  ┌────────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────┐  │
      │  │    SCHEDULE ENGINE     │  │  OPERATIONS (CAMPUS)   │  │    GUIDANCE & HEALTH      │  │
      │  │ • Timetables & Slots   │  │ • Transport & Live GPS │  │ • Counseling Sessions     │  │
      │  │ • Educator Workload    │  │ • Cafeteria & Meals    │  │ • Health & Allergies (Enc)│  │
      │  │ • Room Conflicts       │  │ • Facilities & Assets  │  │ • Confidential Follow-ups │  │
      │  └────────────────────────┘  └────────────────────────┘  └───────────────────────────┘  │
      └───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                                  │
                                                  ▼
      ┌─────────────────────────────────────────────────────────────────────────────────────────┐
      │                       INTELLIGENCE, AUTOMATION & COMMUNICATION                          │
      │  • Communication Hub (SMS, Push, In-App, Email)  • Automation Engine (Event Workflows)  │
      │  • Academic Risk & Signals Engine                • Bilgen AI (Context-Aware Assistant)  │
      │  • Student 360 Aggregator Projection             • School Command Center Realtime Board │
      └─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. PROPOSED DATA MODEL (V2 HİBRİT VARLIK İLİŞKİLERİ)

### 11.1. Tenant, Kurum ve Yetenek Modeli
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE institutions (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(50) NOT NULL, -- PUBLIC_SCHOOL, PRIVATE_SCHOOL, COURSE_CENTER, LANGUAGE_SCHOOL, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE institution_capabilities (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    capability_key VARCHAR(50) NOT NULL, -- ACADEMIC, FINANCE, ATTENDANCE, TRANSPORT, CAFETERIA, CRM, QUESTION_BANK, EXAM_PREP, CERTIFICATION, AI
    is_enabled BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}',
    UNIQUE (institution_id, capability_key)
);

CREATE TABLE campuses (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 11.2. Education Structure Engine (Ortak Soyutlama)
```sql
CREATE TABLE academic_periods (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name VARCHAR(100) NOT NULL, -- "2026-2027 Eğitim Yılı", "2026 Yaz Dönemi", "2026 YKS Sezonu"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE education_programs (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL, -- "Anadolu Lisesi Müfredatı", "YKS Sayısal Hazırlık", "Genel İngilizce"
    structure_type VARCHAR(50) NOT NULL -- K12, COURSE_SEASON, LANGUAGE_LEVEL, VOCATIONAL_MODULE
);

CREATE TABLE education_levels (
    id UUID PRIMARY KEY,
    program_id UUID NOT NULL REFERENCES education_programs(id),
    name VARCHAR(100) NOT NULL, -- "10. Sınıf", "A1 Seviyesi", "Modül 2"
    order_index INT NOT NULL
);

CREATE TABLE education_cohorts (
    id UUID PRIMARY KEY,
    campus_id UUID NOT NULL REFERENCES campuses(id),
    period_id UUID NOT NULL REFERENCES academic_periods(id),
    level_id UUID NOT NULL REFERENCES education_levels(id),
    name VARCHAR(100) NOT NULL, -- "10-A", "Haftasonu YKS-1 Grubu", "Akşam A1-B"
    capacity INT DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 11.3. Party, Identity & Learner Journey
```sql
CREATE TABLE persons (
    id UUID PRIMARY KEY,
    national_id VARCHAR(64) UNIQUE, -- Encrypted at application layer
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    person_id UUID NOT NULL REFERENCES persons(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    mfa_enabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE learners (
    id UUID PRIMARY KEY,
    person_id UUID NOT NULL REFERENCES persons(id),
    primary_institution_id UUID NOT NULL REFERENCES institutions(id),
    learner_number VARCHAR(50),
    journey_stage VARCHAR(50) NOT NULL, -- LEAD, APPLICANT, ENROLLED, ALUMNI, WITHDRAWN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE learner_enrollments (
    id UUID PRIMARY KEY,
    learner_id UUID NOT NULL REFERENCES learners(id),
    cohort_id UUID NOT NULL REFERENCES education_cohorts(id),
    status VARCHAR(50) NOT NULL, -- ACTIVE, COMPLETED, DROPPED, TRANSFERRED
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 12. CAPABILITY ARCHITECTURE (YETENEK MOTORU)

BilgenOS, kurum tipine göre `if-else` yazmak yerine **Institution Capability Engine** üzerinden karar verir:

```typescript
// Örnek Yetenek Sorgu Deseni (Capability Guard)
export class CapabilityService {
  async isEnabled(institutionId: string, capability: CapabilityKey): Promise<boolean> {
    const record = await this.cache.getOrSet(`cap:${institutionId}:${capability}`, () =>
      this.db.institutionCapabilities.findUnique({
        where: { institution_id_capability_key: { institutionId, capabilityKey: capability } }
      })
    );
    return record?.isEnabled ?? false;
  }
}
```

* **Frontend Yansıması:** Kullanıcı arayüzü kurumun açık olan yeteneklerine göre dinamik olarak şekillenir (Örn: Dershanede yemekhane menüsü veya servis modülü görünmez; dil kursunda soru bankası yerine seviye tespit ve sertifika modülleri görünür).
* **API Güvenliği:** Herhangi bir kurumun personeli kendi kurumunda kapalı olan bir capability'nin endpoint'ini çağırırsa HTTP 403 `CAPABILITY_NOT_LICENSED_OR_ENABLED` döner.

---

## 13. EVENT ARCHITECTURE & INITIAL CATALOG (V2 OLAY KATALOĞU)

Domainler arası entegrasyon **Transactional Outbox Pattern** ve asenkron kuyruklar (RabbitMQ / BullMQ) ile sağlanacaktır.

| Olay Adı (Event) | Bounded Context | Payload İçeriği | Tüketiciler ve Aksiyonlar |
| :--- | :--- | :--- | :--- |
| `LeadConvertedEvent` | CRM & Admissions | `leadId, institutionId, personId, programId` | Learner (Öğrenci kaydını aç), Finance (Sözleşme taslağı oluştur) |
| `LearnerEnrolledEvent` | Learner Core | `learnerId, cohortId, periodId, campusId` | Structure (Kontenjan düşür), LMS (Erişim hakkı ver), Parent App (Hoşgeldin bildirimi) |
| `AttendanceMarkedEvent` | Attendance Engine | `sessionId, learnerId, status, timestamp, recordedBy` | Notification Hub (Veliye anlık SMS/Push), Risk Engine (Devamsızlık puanını güncelle) |
| `ExamAssignedEvent` | Assessment Engine | `examInstanceId, cohortId, examDefinitionId, date` | Student App (Takvime ekle), Schedule Engine (Derslik rezervasyonu) |
| `ExamResultsAnalyzedEvent` | Assessment Engine | `examInstanceId, learnerId, outcomeScoreMap[]` | Academic Risk Engine (Gerileme tespiti), Student 360 (Karneye yansıt) |
| `ContractSignedEvent` | Finance OS | `contractId, learnerId, payerId, netCents, installments[]` | Cashier (Tahsilat planını aktifleştir), Access Control (Turnike geçişini onayla) |
| `InstallmentOverdueEvent` | Finance OS | `installmentId, contractId, daysOverdue, amountCents` | Notification Hub (Veli hatırlatması), School Command Center (Mali alarm) |
| `CertificateIssuedEvent` | Certification | `learnerId, programId, certificateCode, issueDate` | Student App (PDF indir), Document Vault (İmzalı arşivle) |

---

## 14. INTEGRATION ARCHITECTURE (ENTEGRASYON ADAPTÖRLERİ)

Çekirdek kod hiçbir harici sağlayıcıya (provider) bağımlı olmayacaktır (**Provider Adapter Pattern / Ports & Adapters**):

* `INotificationProvider` ➔ (Netgsm, İletiMerkezi, Twilio, Firebase FCM, SendGrid).
* `IPaymentGateway` ➔ (İyzico, PayTR, Garanti BBVA, Yapı Kredi vPOS).
* `IAccountingProvider` ➔ (Logo, Paraşüt, Mikro, e-Fatura/e-Arşiv GİB entegratörleri).
* `ITransportTrackingProvider` ➔ (Arvento, Mobiliz veya dahili Driver Mobile GPS).
* `IBiometricAccessProvider` ➔ (ZKTeco, Turnike sistemleri, RFID kart okuyucular).

---

## 15. RECOMMENDED IMPLEMENTATION PHASES (FAZ PLANI)

1. **PHASE 0:** Architecture, Domain Discovery & Contracts (TAMAMLANDI).
2. **PHASE 1:** Bilgen Core (Tenant, Institution, Capability Engine, Identity, Scope-Aware RBAC).
3. **PHASE 2:** Education Structure Engine (Programs, Levels, Cohorts, Academic Periods).
4. **PHASE 3:** Learner Journey & Student 360 Projection (Lead, Student, Guardian, Enrollment).
5. **PHASE 4:** Academic OS & Course Management (Curriculum, Courses, Outcomes, Packages).
6. **PHASE 5:** Attendance Engine (Session/Daily, Excuses, Outbox Parent Dispatch).
7. **PHASE 6:** Assessment & Question Bank Engine (Configurable Exams, Outcome Analytics).
8. **PHASE 7:** Finance OS & Contract Engine (Pricing, Installments, Collections, Reconciliation).
9. **PHASE 8:** Operations Engine (Transportation GPS, Cafeteria, Campus Facilities).
10. **PHASE 9:** Guidance & Health (AES-256 Encrypted Private Counseling & PII).
11. **PHASE 10:** Role-Based Workspaces (Educator, Parent Mobile, Student, School Command Center).
12. **PHASE 11:** Bilgen AI & Academic Risk Engine (Permission-bound Intelligence Layer).
13. **PHASE 12:** Automation Engine & Visual Workflow Builder.

---

## HUMAN GATE & STATUS

Bilgen OS V2 Master Mimari ve Domain Keşif Belgesi tamamlanmıştır. Herhangi bir uygulama kodu yazılmamış olup insan onayı beklenmektedir.

```text
STATUS: BLOCKED — AWAITING HUMAN APPROVAL
```
