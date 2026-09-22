# BİLGEN OS — DOMAIN DISCOVERY & MASTER ARCHITECTURE BLUEPRINT
**Document ID:** `BILGENOS-DOMAIN-DISCOVERY-001`  
**Date:** 2026-09-23  
**Role Context:** SaaS Software Architect, EdTech Specialist, Security & UX Architect  
**Project Workspace:** `bilgenerp` (Greenfield / Sıfır Kod Tabanı)

---

## EXECUTIVE SUMMARY

BilgenOS, standart bir "okul otomasyonu" veya "not çizelgesi" değildir. Bir eğitim kurumunun tüm kurumsal, pedagojik, finansal ve fiziksel dinamiklerini tek bir dijital omurgada birleştiren; **System of Record (Kayıt Sistemi)**, **System of Operations (Operasyon Sistemi)** ve **System of Intelligence (Zekâ Sistemi)** katmanlarından oluşan çok kiracılı (multi-tenant) bir **Okul İşletim Sistemi'dir (School OS)**.

Mevcut çalışma alanı analiz edilmiş, hiçbir legacy (eski) kod ve teknik borç bulunmayan **tamamen temiz bir repo (greenfield)** olduğu tespit edilmiştir. Bu durum, mimariyi tavizsiz bir şekilde doğru prensiplerle kurgulamak için eşsiz bir avantaj sağlamaktadır.

---

## STEP 1 — REPOSITORY & ENVIRONMENT DISCOVERY

* **Mevcut Durum:** Çalışma alanı (`bilgenerp`) incelendi; dizin tamamen boştur.
* **Legacy Kod / Borç:** Yok (Greenfield).
* **Altyapı Bağımlılığı:** Henüz seçilmiş veya kilitlenmiş bir ORM, framework ya da veritabanı kütüphanesi bulunmamaktadır.
* **Değerlendirme:** Sıfırdan başlama serbestisi olduğu için, ileride yıkıcı refactor ve migration maliyetlerinden kaçınmak adına Domain-Driven Design (DDD), Modular Monolith (Modüler Monolit) ve Event-Driven mimari prensipleri başlangıçtan itibaren çekirdek kural olarak benimsenecektir.

---

## STEP 2 — DOMAIN INVENTORY (HEDEF ETKİ ALANLARI)

BilgenOS çekirdeği birbirini doğrudan veritabanı seviyesinde kilitlemeyen, sınırları kesin çizilmiş (Bounded Contexts) şu domainlerden oluşacaktır:

```
                                    ┌───────────────────────┐
                                    │    BİLGEN OS CORE     │
                                    │ Multi-Tenant, Identity│
                                    │  RBAC/ABAC, Person    │
                                    └───────────┬───────────┘
                                                │
         ┌────────────────────────┬─────────────┴────────────┬────────────────────────┐
         ▼                        ▼                          ▼                        ▼
 ┌───────────────┐        ┌───────────────┐          ┌───────────────┐        ┌───────────────┐
 │  ACADEMIC OS  │        │ OPERATIONS OS │          │  FINANCE OS   │        │ GUIDANCE & HR │
 │ Curriculum    │        │ Attendance    │          │ Contracts     │        │ Confidential  │
 │ Assessments   │        │ Transportation│          │ Installments  │        │ PDR Records   │
 │ Homework/Rubr.│        │ Cafeteria     │          │ Collections   │        │ Staff Payroll │
 │ Outcomes      │        │ Campus/Assets │          │ Scholarships  │        │ Workload      │
 └───────┬───────┘        └───────┬───────┘          └───────┬───────┘        └───────┬───────┘
         │                        │                          │                        │
         └────────────────────────┴─────────────┬────────────┴────────────────────────┘
                                                ▼
                                    ┌───────────────────────┐
                                    │     EVENT BUS /       │
                                    │ TRANSACTIONAL OUTBOX  │
                                    └───────────┬───────────┘
                                                ▼
                        ┌───────────────────────────────────────────────┐
                        │ INTELLIGENCE & EXTENSIONS                     │
                        │ • Academic Risk Engine • School Command Center│
                        │ • Communication Hub    • Bilgen AI Layer      │
                        │ • Automation Workflows                        │
                        └───────────────────────────────────────────────┘
```

1. **Identity & Core Domain:** Tenant (Organization, Institution, Campus), Person, User, Role, Scope, Permission.
2. **Student Journey & SIS Domain:** Candidate, Lead, Enrollment, StudentProfile (Student 360), GuardianRelationship, ClassroomAssignment, Historical Snapshots.
3. **Academic OS Domain:** Curriculum, Course, Unit, Topic, LearningOutcome, Lesson, Assignment, Rubric.
4. **Assessment Engine Domain:** QuestionBank, Question, QuestionTag, Exam, ExamResult, StudentOutcomePerformance, QuestionAnalytics.
5. **Attendance Engine Domain:** SessionAttendance, DailyAttendance, LateArrival, EarlyDismissal, ExcuseRecord, AttendanceEventStream.
6. **Schedule Engine Domain:** Timetable, TimeSlot, RoomAssignment, TeacherWorkload, ConstraintMatrix.
7. **Finance OS Domain:** FeeCategory, PricingPlan, ScholarshipDiscount, EnrollmentContract, InstallmentSchedule, PaymentTransaction, LedgerReconciliation.
8. **Operations Domain:**
   - *Transportation:* Route, Stop, Vehicle, Driver, Attendant, StudentRouteAssignment, LiveTrip.
   - *Cafeteria:* MealPlan, DailyMenu, DietaryRestriction/Allergy, MealConsumption.
   - *Campus Assets:* Facility, Building, Room/Lab, InventoryItem, MaintenanceRecord, Booking.
9. **Guidance & Health Domain (Strict PII):** CounselingSession, DevelopmentPlan, BehavioralObservation, HealthRecord, MedicalAlert.
10. **Communication & Event Domain:** NotificationTemplate, ChannelDispatch (SMS, Push, In-App, Email), InAppInbox, EventLog.
11. **Intelligence & Analytics Domain:** AcademicRiskEngine, SchoolCommandCenterAggregator, BilgenAI ContextBroker, AutomationEngine.

---

## STEP 3 — COLLISION ANALYSIS & ANTI-PATTERNS (ÇAKIŞMA VE TUZAK ANALİZİ)

Sıfırdan kurulan eğitim ve ERP sistemlerinde en sık yapılan ve geri dönüşü son derece pahalı olan tuzaklar analiz edilmiş ve projenin anayasası niteliğindeki kurallar belirlenmiştir:

| Geleneksel Hata (Anti-Pattern) | Neden Olduğu Problem | BilgenOS Yaklaşımı |
| :--- | :--- | :--- |
| **User = Person = Role Karışıklığı** | Bir öğretmen aynı zamanda veli olduğunda iki ayrı hesap açılması gerekir veya yetkiler birbirine girer. | **Person (Birey)** tekildir. **User (Giriş/Kimlik)** ayrıdır. Bir Person birden fazla role (`Student`, `Teacher`, `Guardian`, `Staff`) ve birden fazla organizasyona bağlanabilir. |
| **Tenant Filtresini Client / UI'a Bırakmak** | Veri sızıntısı (Cross-tenant data breach), güvenlik zafiyeti. | Tüm veritabanı sorguları ORM/Query düzeyinde tenancy scope (`TenantId`, `InstitutionId`, `CampusId`) filtresine zorunlu tabi tutulur (Row-Level Security veya Global Query Filter). |
| **Para Birimlerini `float` / `double` Tutmak** | Kuruş yuvarlama farkları, mali denetimlerde açık çıkması. | Tüm parasal tutarlar tam sayı (en küçük para birimi - cent/kuruş integer) ya da `DECIMAL(18,4)` formatında saklanır. |
| **Yoklamayı Salt Boolean (`isAbsent: true`) Yapmak** | Gecikmeler, izinler, ders bazlı yoklamalar ve veli ihtar süreçleri takip edilemez. | Yoklama durum motoru (`Present`, `Late`, `ExcusedAbsent`, `UnexcusedAbsent`, `LeftEarly`) ve event akışı ile modellenir. |
| **Notları Yalnızca Sayı Olarak Kaydetmek** | "Öğrenci matematikten 60 aldı" denir ama hangi konuyu/kazanımı bilmediği anlaşılamaz. | Notlar **Öğrenme Kazanımları (Learning Outcomes)** ve rubrik kriterleriyle ilişkilendirilir. |
| **Rehberlik & Sağlık Verilerini Düz Veri Yapmak** | KVKK/GDPR ihlali; normal bir öğretmenin velinin boşanma/hastalık notlarını görmesi. | Field-level encryption + kesin izole edilmiş ayrı Authorization Policy + Denetim/Audit İzleme zorunluluğu. |
| **Student 360 İçin Veri Kopyalama (Cache duplication)** | Veri tutarsızlığı (Örn. finans borcu ödendi ama öğrenci ekranında ödenmedi görünüyor). | Student 360 bir veri tablosu değil, ilgili domainlerin verilerini gerçek zamanlı derleyen bir **Read Model / Aggregator View** olur. |
| **Akademik Yıl Değişiminde Geçmişin Üzerine Yazmak** | Bir öğrenci 5. sınıfa geçtiğinde 4. sınıftaki öğretmenleri, şubesi ve o yıla ait karne verisi kaybolur. | **Temporal Snapshotting / AcademicYearScope:** Her kayıt ait olduğu akademik yıl kimliğiyle dondurulabilir olmalıdır. |

---

## STEP 4 — TARGET ARCHITECTURE PROPOSAL

BilgenOS için önerilen hedef sistem mimarisi: **Modular Monolith ile başlayan, Domain-Driven Design (DDD) tabanlı ve Event-Driven Core ile desteklenen mimaridir.**

```
                       ┌────────────────────────────────────────────────────────┐
                       │                   API GATEWAY LAYER                    │
                       │ Rate Limiting, Tenant Resolver, JWT/Session Auth, CORS │
                       └───────────────────────────┬────────────────────────────┘
                                                   │
     ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
     │                                     CORE APPLICATION ENGINE                               │
     │                                                                                           │
     │  ┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────────────┐  │
     │  │   Presentation Layer   │  │   Domain / Business    │  │    Infrastructure Layer     │  │
     │  │   REST / GraphQL / RPC │  │   Aggregates, Entities │  │    PostgreSQL (JSONB/Rel)   │  │
     │  │   Strict DTO & Schema  │──│   Domain Services      │──│    Prisma / EF Core / Drizz.│  │
     │  │   Role/Scope Guards    │  │   Value Objects        │  │    S3 Private Storage       │  │
     │  └────────────────────────┘  └───────────┬────────────┘  └─────────────────────────────┘  │
     │                                          │                                                │
     │                                          ▼                                                │
     │                            ┌───────────────────────────┐                                  │
     │                            │ Transactional Outbox Table│                                  │
     │                            └─────────────┬─────────────┘                                  │
     └──────────────────────────────────────────┼────────────────────────────────────────────────┘
                                                │
                                                ▼
                               ┌─────────────────────────────────┐
                               │ Background Worker / Message Bus │
                               │ (Redis / BullMQ / RabbitMQ)     │
                               └────────────────┬────────────────┘
                                                │
         ┌────────────────────────┬─────────────┴─────────────┬────────────────────────┐
         ▼                        ▼                           ▼                        ▼
 ┌───────────────┐        ┌───────────────┐           ┌───────────────┐        ┌───────────────┐
 │ Notifications │        │ Risk Engine   │           │ Audit Logger  │        │ Integrations  │
 │ (SMS/Push/Mail│        │ (Analytics)   │           │ (Immutable)   │        │ (Banks, e-Fat)│
 └───────────────┘        └───────────────┘           └───────────────┘        └───────────────┘
```

### Önerilen Teknoloji Yığını:
* **Backend:** TypeScript / NestJS veya C# / .NET 9 (Kurumsal DDD, güçlü tip güvenliği ve modüler sınırlar için).
* **Veritabanı:** PostgreSQL (İlişkisel bütünlük, Row-Level Security, JSONB desteği).
* **ORM:** Prisma veya Drizzle (TypeScript için) / EF Core (.NET için).
* **Mesajlaşma & Outbox:** Transactional Outbox Pattern + Redis & BullMQ.
* **Frontend:** Next.js (React 19, App Router) + TailwindCSS + shadcn/ui + TanStack Query / Table.
* **Depolama:** S3 uyumlu Object Storage + Pre-signed URL (Doğrudan erişime kapalı bucket).

---

## STEP 5 — DATA MODEL PROPOSAL (TEMEL VARLIK ŞEMASI)

### 5.1. Çok Kiracılı Hiyerarşi
```
Organization (Holding / Şirket / Vakıf)
   └── Institution (Okul Markası / Tüzel Kişilik)
         └── Campus (Fiziksel Kampüs / Yerleşke)
               ├── AcademicYear (Örn: 2026-2027)
               │     └── Term (Güz / Bahar)
               └── SchoolLevel (Anaokulu, İlkokul, Ortaokul, Lise)
                     └── Grade (9. Sınıf, 10. Sınıf)
                           └── ClassSection (10-A, 10-B)
```

### 5.2. Kimlik, Birey ve Kullanıcı Ayrımı (Identity Core)
```sql
Person (
    id UUID PRIMARY KEY,
    national_id VARCHAR(32) ENCRYPTED,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(20),
    blood_type VARCHAR(10),
    created_at TIMESTAMP
)

User (
    id UUID PRIMARY KEY,
    person_id UUID REFERENCES Person(id),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    password_hash VARCHAR(255),
    is_active BOOLEAN,
    mfa_enabled BOOLEAN
)

UserRoleAssignment (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES User(id),
    role_key VARCHAR(50), -- TEACHER, GUARDIAN, FINANCE_OFFICER, etc.
    scope_type VARCHAR(50), -- ORGANIZATION, INSTITUTION, CAMPUS, SECTION
    scope_id UUID,
    is_primary BOOLEAN,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP
)
```

### 5.3. Öğrenci Yolculuğu (Student Journey Core)
```sql
Student (
    id UUID PRIMARY KEY,
    person_id UUID REFERENCES Person(id),
    student_number VARCHAR(50),
    current_campus_id UUID REFERENCES Campus(id),
    current_status VARCHAR(50) -- CANDIDATE, ENROLLED, SUSPENDED, ALUMNI, TRANSFERRED
)

StudentEnrollment (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES Student(id),
    academic_year_id UUID REFERENCES AcademicYear(id),
    school_level_id UUID REFERENCES SchoolLevel(id),
    grade_id UUID REFERENCES Grade(id),
    class_section_id UUID REFERENCES ClassSection(id),
    enrollment_date DATE,
    status VARCHAR(50) -- ACTIVE, WITHDRAWN, COMPLETED
)

StudentGuardian (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES Student(id),
    guardian_person_id UUID REFERENCES Person(id),
    relationship_type VARCHAR(50), -- MOTHER, FATHER, LEGAL_GUARDIAN, EMERGENCY_CONTACT
    is_legal_custodian BOOLEAN,
    is_emergency_contact BOOLEAN,
    is_financial_responsible BOOLEAN,
    can_pickup BOOLEAN
)
```

### 5.4. Finansal Sözleşme ve Taksit Çekirdeği
```sql
EnrollmentContract (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES Student(id),
    payer_person_id UUID REFERENCES Person(id),
    academic_year_id UUID REFERENCES AcademicYear(id),
    base_tuition_amount_cents BIGINT,
    discount_total_cents BIGINT,
    services_total_cents BIGINT, -- Servis, Yemek, Kitap vb.
    net_total_amount_cents BIGINT,
    status VARCHAR(50), -- DRAFT, SIGNED, ACTIVE, CANCELLED
    signed_at TIMESTAMP
)

Installment (
    id UUID PRIMARY KEY,
    contract_id UUID REFERENCES EnrollmentContract(id),
    installment_no INT,
    due_date DATE,
    amount_cents BIGINT,
    paid_amount_cents BIGINT DEFAULT 0,
    status VARCHAR(50) -- PENDING, PARTIALLY_PAID, PAID, OVERDUE
)
```

---

## STEP 6 — AUTHORIZATION & SCOPE MATRIX

Yetkilendirme sistemi; düz rol bazlı (RBAC) değil, **Hiyerarşik Kapsam (Scope-Aware ABAC/RBAC)** modelidir. Bir kullanıcı sistemde "Öğretmen" olabilir; ancak yalnızca `Campus: A` ve `ClassSection: 10-A` sınırlarında yetkilidir.

| Rol Kodu | Varsayılan Kapsam (Scope) | İzin Verilen Alanlar | Kısıtlı / Yasaklı Alanlar |
| :--- | :--- | :--- | :--- |
| `PLATFORM_SUPERADMIN` | Platform | Sistem geneli, tenant oluşturma, küresel lisans | Okul içi özel PII / gizli sağlık verileri (denetimsiz okunamaz) |
| `ORGANIZATION_ADMIN` | Organization | Organizasyona bağlı tüm okul ve kampüsler | Platform yönetim seviyesi |
| `CAMPUS_DIRECTOR` | Campus | İlgili kampüsteki tüm akademik, idari ve operasyonel veriler | Diğer kampüslerin verileri, şirket seviyesi hissedar finansı |
| `TEACHER` | Section / OwnCourses | Kendi dersleri, kendi şubelerindeki öğrenciler, yoklama, ödev, not girişi | Sözleşmeler, veli ödeme bilgileri, diğer sınıfların notları |
| `GUIDANCE_COUNSELOR` | Campus / Grade (Strict) | Öğrenci gelişim planları, rehberlik notları, özel gözlemler | Finansal tahsilatlar, servis güzergahları |
| `FINANCE_OFFICER` | Campus / Institution | Sözleşmeler, fiyatlandırma, tahsilatlar, taksitler, banka mutabakatı | Not girişleri, sağlık/rehberlik detayları, sınav soruları |
| `PARENT` | OwnChildren | Yalnızca kendi çocuklarının notları, devamsızlığı, ödevleri, ödemeleri | Diğer öğrencilerin bilgileri, sınıf ortalaması dışındaki ham veriler |
| `STUDENT` | Self | Kendi ders programı, ödev teslimleri, sınav takvimi, duyurular | Finansal sözleşme ayrıntıları, idari ve öğretmen notları |

---

## STEP 7 — INITIAL DOMAIN EVENT CATALOG

Domainler arası asenkron iletişim için tanımlanan ilk çekirdek olaylar (Events):

| Event Adı | Tetikleyen Domain | Yük (Payload Özeti) | Dinleyen Tüketiciler (Consumers) |
| :--- | :--- | :--- | :--- |
| `StudentEnrolledEvent` | SIS / Enrollment | `studentId, campusId, academicYearId, gradeId` | Finance (Sözleşme taslağı aç), Campus (Doluluk güncelle), LMS (Hesap aç) |
| `AttendanceRecordedEvent` | Attendance | `studentId, sessionId, date, status, recordedBy` | Notification Hub (Veliye SMS/Push), Risk Engine (Devamsızlık puanı) |
| `ExamResultsPublishedEvent` | Assessment | `examId, courseId, sectionId, publishedAt` | Parent App, Student App, Analytics Engine (Kazanım başarısı) |
| `ContractSignedEvent` | Finance | `contractId, studentId, payerId, netAmount` | Accounting (Fatura planı), Cafeteria/Transport (Erişim hakkı tanımla) |
| `InstallmentOverdueEvent` | Finance | `installmentId, contractId, daysPastDue, amount` | Notification Hub (Hatırlatma), School Command Center (Risk göstergesi) |
| `BusTripStartedEvent` | Transportation | `tripId, routeId, driverId, startTime` | Parent Mobile (Harita takibi aktif et) |
| `AcademicRiskFlaggedEvent` | Risk Engine | `studentId, indicatorType, severity, confidence` | Guidance Workspace (Takip görevi aç), Academic Director |

---

## STEP 8 — DEVELOPMENT ROADMAP & GATES

```
[Phase 0: Discovery & Architecture] ➔ GATE (Human Approval)
   │
[Phase 1: Bilgen Core & Identity] ➔ GATE
   │
[Phase 2: Student Information System & Student 360 Aggregator] ➔ GATE
   │
[Phase 3: Academic OS & Curriculum] ➔ GATE
   │
[Phase 4: Attendance Engine & Event Stream] ➔ GATE
   │
[Phase 5: Assessment Engine & Learning Outcome Analytics] ➔ GATE
   │
[Phase 6: Workspaces: Teacher, Parent Mobile, Student] ➔ GATE
   │
[Phase 7: Finance OS: Contracts, Installments, Reconciliation] ➔ GATE
   │
[Phase 8: Operations: Transportation, Cafeteria, Campus Assets] ➔ GATE
   │
[Phase 9: Guidance & HR: Confidential PII & Workload] ➔ GATE
   │
[Phase 10: School Command Center: Real-time Executive Board] ➔ GATE
   │
[Phase 11: Bilgen AI: Permission-Aware Intelligence Layer] ➔ GATE
   │
[Phase 12: Automation Engine: Workflow Triggers & Actions] ➔ GATE
```

Her faz tamamlandığında `PHASE-X-IMPLEMENTATION-REPORT.md` oluşturulacak ve insan onayı (`STATUS: AWAITING HUMAN APPROVAL`) alınmadan sonraki faza geçilmeyecektir.

---

## STEP 9 — RISK ASSESSMENT & COMPLIANCE REPORT

1. **Çocuk Verileri ve KVKK/GDPR Uyumluluğu (Kritik):**
   - 18 yaş altı bireylerin verileri işlenmektedir. Veli rızası (Açık Rıza) dijital sözleşme esnasında zaman damgalı olarak kayıt altına alınmalıdır.
   - Sağlık (alerji, kronik hastalık) ve rehberlik verileri özel nitelikli kişisel veridir; veritabanında ayrı tablolarda ve şifrelenmiş (AES-256 / column encryption) olarak tutulmalıdır.
2. **Finansal Bütünlük ve Denetim (Audit Integrity):**
   - Kayıtlı sözleşmeler ve tahsilatlar silinemez (hard delete yasaktır). Düzeltmeler yalnızca ters kayıt (Credit Note / İade Kaydı) ile yapılabilir.
   - Para transferleri ve ödeme işlemleri `idempotency-key` ile korunmalıdır.
3. **Tenant İzolasyonu Zafiyeti:**
   - Çok kiracılı SaaS sistemlerinde en büyük felaket bir okulun verisinin diğerine sızmasıdır. Mimari düzeyde Postgres Row Level Security (RLS) veya Entity Framework / Prisma middleware seviyesinde zorunlu tenant ayrımı uygulanacaktır.
4. **AI Halüsinasyonu ve Yetki Atlama (Prompt Injection / Bypass):**
   - Bilgen AI, doğrudan SQL veya veritabanına bağlanamaz. Yalnızca oturum açmış kullanıcının yetki token'ı üzerinden çalışan API katmanı ve Function Calling / Tool Calling aracılığıyla veriye ulaşabilir.
   - "Öğrenci başarısız olacak" gibi deterministik tıbbi/psikolojik teşhis ifadeleri yerine "Kazanım bazlı performans verisi" sunulacaktır.

---

## STEP 10 — HUMAN GATE

Discovery ve mimari temel başarıyla çıkarılmıştır. Mevcut dizin sıfır kod tabanına sahiptir. Yukarıdaki kurallara ve mimari plana bağlı kalarak **Faz 1 (Bilgen Core, Tenant, Identity & RBAC)** aşamasına geçilmesi insan onayına sunulmuştur.

```text
STATUS: BLOCKED — AWAITING HUMAN APPROVAL
```
