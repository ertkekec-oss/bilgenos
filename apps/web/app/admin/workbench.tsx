'use client';

import React, { useState } from 'react';
import {
  CapabilityKey,
  CapabilityState,
  EnrollmentDto,
  GuardianRelationshipDto,
  InstitutionCapabilityDto,
  InstitutionDto,
  LearnerDto,
  PersonDto,
} from '@bilgenos/contracts';
import { BILGEN_TOKENS, CapabilityCell, ExcelTable, StatusBadge } from '@bilgenos/ui';

type ActiveTab =
  | 'INSTITUTIONS'
  | 'PEOPLE'
  | 'LEARNERS'
  | 'STRUCTURE'
  | 'ENROLLMENTS'
  | 'ADMISSIONS'
  | 'COMMERCIAL'
  | 'PAYMENTS'
  | 'INTEGRATION'
  | 'CAPABILITIES'
  | 'AUDIT';

export function CoreAdministrationWorkbench(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ActiveTab>('CAPABILITIES');

  // Sample seed state demonstrating the system
  const [institutions] = useState<InstitutionDto[]>([
    {
      id: 'inst-1',
      tenantId: 'tenant-100',
      organizationId: 'org-1',
      code: 'BILGEN-KOLEJ',
      name: 'Bilgen Fen ve Anadolu Lisesi',
      institutionType: 'COLLEGE',
      isActive: true,
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 'inst-2',
      tenantId: 'tenant-100',
      organizationId: 'org-1',
      code: 'BILGEN-YKS',
      name: 'Bilgen YKS Hazırlık Merkezi',
      institutionType: 'EXAM_PREP_CENTER',
      isActive: true,
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 'inst-3',
      tenantId: 'tenant-100',
      organizationId: 'org-1',
      code: 'BILGEN-DIL',
      name: 'Bilgen Yabancı Dil Akademisi',
      institutionType: 'LANGUAGE_SCHOOL',
      isActive: true,
      createdAt: '2026-09-01T08:00:00Z',
    },
  ]);

  const [capabilities, setCapabilities] = useState<InstitutionCapabilityDto[]>([
    { id: 'c1', institutionId: 'inst-1', capabilityKey: 'ACADEMIC', state: 'ENABLED', createdAt: '' },
    { id: 'c2', institutionId: 'inst-1', capabilityKey: 'CURRICULUM', state: 'ENABLED', createdAt: '' },
    { id: 'c3', institutionId: 'inst-1', capabilityKey: 'ASSESSMENT', state: 'ENABLED', createdAt: '' },
    { id: 'c4', institutionId: 'inst-1', capabilityKey: 'TRANSPORTATION', state: 'READ_ONLY', createdAt: '' },
    { id: 'c5', institutionId: 'inst-1', capabilityKey: 'CAFETERIA', state: 'ENABLED', createdAt: '' },
    { id: 'c6', institutionId: 'inst-2', capabilityKey: 'QUESTION_BANK', state: 'ENABLED', createdAt: '' },
    { id: 'c7', institutionId: 'inst-2', capabilityKey: 'EXAM_PREP', state: 'ENABLED', createdAt: '' },
    { id: 'c8', institutionId: 'inst-2', capabilityKey: 'TRANSPORTATION', state: 'DISABLED', createdAt: '' },
    { id: 'c9', institutionId: 'inst-3', capabilityKey: 'ASSESSMENT', state: 'ENABLED', createdAt: '' },
    { id: 'c10', institutionId: 'inst-3', capabilityKey: 'TRANSPORTATION', state: 'DISABLED', createdAt: '' },
  ]);

  const [persons] = useState<PersonDto[]>([
    {
      id: 'p-1',
      tenantId: 'tenant-100',
      firstName: 'Kerem',
      lastName: 'Bilgen',
      nationalIdEncrypted: 'TR-987654321',
      emergencyPhone: '+90 555 111 2233',
      createdAt: '2026-09-10T10:00:00Z',
    },
    {
      id: 'p-2',
      tenantId: 'tenant-100',
      firstName: 'Fatma',
      lastName: 'Bilgen',
      emergencyPhone: '+90 555 222 3344',
      createdAt: '2026-09-10T10:00:00Z',
    },
  ]);

  const [learners] = useState<LearnerDto[]>([
    {
      id: 'l-1',
      tenantId: 'tenant-100',
      personId: 'p-1',
      institutionId: 'inst-1',
      learnerNumber: 'STU-2026-0042',
      status: 'ACTIVE',
      createdAt: '2026-09-12T09:00:00Z',
    },
  ]);

  const [guardians] = useState<GuardianRelationshipDto[]>([
    {
      id: 'g-1',
      tenantId: 'tenant-100',
      guardianPersonId: 'p-2',
      learnerId: 'l-1',
      relationshipType: 'MOTHER',
      isLegalGuardian: true,
      isFinancialResponsible: true,
      isEmergencyContact: true,
      isPickupAuthorized: true,
      validFrom: '2026-09-01',
      status: 'ACTIVE',
      createdAt: '2026-09-12T09:00:00Z',
    },
  ]);

  const [enrollments] = useState<EnrollmentDto[]>([
    {
      id: 'enr-1',
      tenantId: 'tenant-100',
      institutionId: 'inst-1',
      programId: 'prog-fen-lisesi',
      cohortId: 'cohort-10a',
      learnerId: 'l-1',
      enrollmentNumber: 'ENR-884912',
      status: 'ACTIVE',
      startDate: '2026-09-15',
      createdAt: '2026-09-15T08:00:00Z',
    },
    {
      id: 'enr-old',
      tenantId: 'tenant-100',
      institutionId: 'inst-2',
      programId: 'prog-yks-sayisal',
      learnerId: 'l-1',
      enrollmentNumber: 'ENR-772101',
      status: 'TRANSFERRED',
      startDate: '2026-06-01',
      actualEndDate: '2026-09-15',
      transferDetails: {
        targetInstitutionId: 'inst-1',
        transferredAt: '2026-09-15T08:00:00Z',
        reason: 'Tam zamanlı fen lisesine geçiş',
      },
      createdAt: '2026-06-01T08:00:00Z',
    },
  ]);

  const handleToggleCapability = (key: CapabilityKey, targetState: CapabilityState) => {
    setCapabilities((prev) =>
      prev.map((c) => (c.capabilityKey === key ? { ...c, state: targetState } : c))
    );
  };

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'CAPABILITIES', label: '1. Yetenek Matrisi (Governance)' },
    { id: 'INSTITUTIONS', label: '2. Kurum & Kampüsler' },
    { id: 'PEOPLE', label: '3. Bireyler & Kimlik' },
    { id: 'LEARNERS', label: '4. Öğrenenler & Velayet' },
    { id: 'ENROLLMENTS', label: '5. Hizmet Kayıtları & Transfer' },
    { id: 'ADMISSIONS', label: '6. Adaylar & Başvurular (CRM)' },
    { id: 'COMMERCIAL', label: '7. Ticari Kayıt & Sözleşme' },
    { id: 'PAYMENTS', label: '8. Ödeme Planı & Taksitler' },
    { id: 'INTEGRATION', label: '9. BilgenOkul Integration Hub' },
    { id: 'AUDIT', label: '10. Güvenlik & Denetim İzi' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <header
        style={{
          height: '42px',
          borderBottom: `1px solid ${BILGEN_TOKENS.colors.borderStrong}`,
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: BILGEN_TOKENS.typography.fontFamilyMono,
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '0.05em',
              color: BILGEN_TOKENS.colors.accent,
            }}
          >
            BİLGEN OS
          </span>
          <span style={{ color: BILGEN_TOKENS.colors.borderStrong }}>|</span>
          <span style={{ fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
            Core Administration Workbench (v2.1 — Corporate Light)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
          <span style={{ color: BILGEN_TOKENS.colors.textSecondary }}>
            Tenant:{' '}
            <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>
              TENANT-BİLGEN-HOLDING
            </strong>
          </span>
          <StatusBadge label="DEFENSE-IN-DEPTH ACTIVE" variant="success" />
        </div>
      </header>

      {/* Main Workbench Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Navigation Sidebar (Excel Tab Style) */}
        <aside
          style={{
            width: '240px',
            borderRight: `1px solid ${BILGEN_TOKENS.colors.border}`,
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: BILGEN_TOKENS.colors.textMuted,
              borderBottom: `1px solid ${BILGEN_TOKENS.colors.border}`,
            }}
          >
            Çalışma Sayfaları
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: activeTab === item.id ? 600 : 400,
                color:
                  activeTab === item.id
                    ? BILGEN_TOKENS.colors.accent
                    : BILGEN_TOKENS.colors.textPrimary,
                backgroundColor: activeTab === item.id ? '#F1F5F9' : 'transparent',
                border: 'none',
                borderLeft:
                  activeTab === item.id
                    ? `3px solid ${BILGEN_TOKENS.colors.accent}`
                    : '3px solid transparent',
                borderBottom: `1px solid ${BILGEN_TOKENS.colors.border}`,
                cursor: 'pointer',
                borderRadius: '0px',
              }}
            >
              {item.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '16px', backgroundColor: BILGEN_TOKENS.colors.canvas }}>
          {activeTab === 'CAPABILITIES' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Kurum Yetenekleri Yönetim Matrisi (Capability Governance)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Yetenekler çok durumlu yönetilir (ENABLED, READ_ONLY, DISABLED, SUSPENDED). Kapalı yetenekler domain verilerini silmez; dondurur.
                  </p>
                </div>
                <StatusBadge label="DAG CYCLE VALIDATOR: PASS" variant="success" />
              </div>

              <ExcelTable<InstitutionCapabilityDto>
                keyExtractor={(row) => row.id}
                data={capabilities}
                columns={[
                  { key: 'institutionId', header: 'Kurum Kodu', width: '140px' },
                  { key: 'capabilityKey', header: 'Yetenek Anahtarı', width: '180px' },
                  {
                    key: 'state',
                    header: 'Yetenek Durumu (Multi-State)',
                    width: '260px',
                    render: (row) => (
                      <CapabilityCell
                        capabilityKey={row.capabilityKey as CapabilityKey}
                        state={row.state as CapabilityState}
                        onToggleState={handleToggleCapability}
                      />
                    ),
                  },
                  {
                    key: 'policy',
                    header: 'Yasal/Mali Politika',
                    render: (row) => (
                      <span style={{ fontSize: '12px', color: BILGEN_TOKENS.colors.textMuted }}>
                        {row.state === 'READ_ONLY'
                          ? 'Mali Saklama: Salt-okunur denetim izi'
                          : row.state === 'DISABLED'
                          ? 'Donduruldu: Veri kaybı yok'
                          : 'Tam erişim açık'}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          )}

          {activeTab === 'INSTITUTIONS' && (
            <div>
              <h2 style={{ fontSize: '15px', margin: '0 0 12px 0', fontWeight: 700 }}>
                Kayıtlı Kurumlar (Institutions Registry)
              </h2>
              <ExcelTable<InstitutionDto>
                keyExtractor={(row) => row.id}
                data={institutions}
                columns={[
                  { key: 'code', header: 'Kurum Kodu', width: '160px' },
                  { key: 'name', header: 'Kurum Adı' },
                  { key: 'institutionType', header: 'Kurum Türü', width: '180px' },
                  {
                    key: 'isActive',
                    header: 'Durum',
                    width: '100px',
                    render: (row) => (
                      <StatusBadge
                        label={row.isActive ? 'AKTİF' : 'PASİF'}
                        variant={row.isActive ? 'success' : 'default'}
                      />
                    ),
                  },
                  { key: 'createdAt', header: 'Kayıt Tarihi', width: '180px', isNumeric: true },
                ]}
              />
            </div>
          )}

          {activeTab === 'PEOPLE' && (
            <div>
              <h2 style={{ fontSize: '15px', margin: '0 0 12px 0', fontWeight: 700 }}>
                Bireyler (Person Identity Core)
              </h2>
              <ExcelTable<PersonDto>
                keyExtractor={(row) => row.id}
                data={persons}
                columns={[
                  { key: 'firstName', header: 'Adı', width: '140px' },
                  { key: 'lastName', header: 'Soyadı', width: '140px' },
                  {
                    key: 'nationalIdEncrypted',
                    header: 'Kimlik (Encrypted)',
                    width: '180px',
                    render: (row) => (
                      <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, fontSize: '12px' }}>
                        {row.nationalIdEncrypted || 'BELİRTİLMEDİ'}
                      </span>
                    ),
                  },
                  { key: 'emergencyPhone', header: 'İletişim / Acil', width: '180px', isNumeric: true },
                  { key: 'createdAt', header: 'Oluşturulma', isNumeric: true },
                ]}
              />
            </div>
          )}

          {activeTab === 'LEARNERS' && (
            <div>
              <h2 style={{ fontSize: '15px', margin: '0 0 12px 0', fontWeight: 700 }}>
                Öğrenenler ve Yasal Velayet Matrisi
              </h2>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '13px', margin: '0 0 8px 0', color: BILGEN_TOKENS.colors.textSecondary }}>
                  Öğrenen Kayıtları
                </h3>
                <ExcelTable<LearnerDto>
                  keyExtractor={(row) => row.id}
                  data={learners}
                  columns={[
                    { key: 'learnerNumber', header: 'Öğrenci / Kursiyer No', width: '180px' },
                    { key: 'institutionId', header: 'Bağlı Kurum', width: '140px' },
                    {
                      key: 'status',
                      header: 'Durum',
                      width: '120px',
                      render: (row) => <StatusBadge label={row.status} variant="success" />,
                    },
                    { key: 'createdAt', header: 'Kayıt Tarihi', isNumeric: true },
                  ]}
                />
              </div>

              <div>
                <h3 style={{ fontSize: '13px', margin: '0 0 8px 0', color: BILGEN_TOKENS.colors.textSecondary }}>
                  Bağımsız Veli İlişkileri (Guardian Relationships)
                </h3>
                <ExcelTable<GuardianRelationshipDto>
                  keyExtractor={(row) => row.id}
                  data={guardians}
                  columns={[
                    { key: 'relationshipType', header: 'İlişki Türü', width: '120px' },
                    {
                      key: 'isLegalGuardian',
                      header: 'Yasal Vasi',
                      width: '100px',
                      render: (row) => (row.isLegalGuardian ? 'EVET' : 'HAYIR'),
                    },
                    {
                      key: 'isFinancialResponsible',
                      header: 'Mali Sorumlu',
                      width: '110px',
                      render: (row) => (row.isFinancialResponsible ? 'EVET (Muhatap)' : 'HAYIR'),
                    },
                    {
                      key: 'isPickupAuthorized',
                      header: 'Teslim Yetkisi',
                      width: '110px',
                      render: (row) => (row.isPickupAuthorized ? 'YETKİLİ' : 'YETKİSİZ'),
                    },
                    { key: 'validFrom', header: 'Başlangıç', width: '120px', isNumeric: true },
                    {
                      key: 'status',
                      header: 'İlişki Durumu',
                      width: '100px',
                      render: (row) => <StatusBadge label={row.status} variant="success" />,
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'ENROLLMENTS' && (
            <div>
              <h2 style={{ fontSize: '15px', margin: '0 0 12px 0', fontWeight: 700 }}>
                Kayıtlar ve Tarihsel Transfer İzi
              </h2>
              <ExcelTable<EnrollmentDto>
                keyExtractor={(row) => row.id}
                data={enrollments}
                columns={[
                  { key: 'enrollmentNumber', header: 'Kayıt No', width: '140px' },
                  { key: 'programId', header: 'Program' },
                  {
                    key: 'cohortId',
                    header: 'Kohort / Grup',
                    width: '160px',
                    render: (row) => row.cohortId || 'BİREBİR SEANS (Özel)',
                  },
                  {
                    key: 'status',
                    header: 'Kayıt Durumu',
                    width: '140px',
                    render: (row) => (
                      <StatusBadge
                        label={row.status}
                        variant={
                          row.status === 'ACTIVE'
                            ? 'success'
                            : row.status === 'TRANSFERRED'
                            ? 'warning'
                            : 'default'
                        }
                      />
                    ),
                  },
                  {
                    key: 'lineage',
                    header: 'Transfer ve Tarihçe İzi',
                    render: (row) =>
                      row.transferDetails ? (
                        <span style={{ fontSize: '11px', color: BILGEN_TOKENS.colors.textSecondary }}>
                          Hedef Kurum: <strong>{row.transferDetails.targetInstitutionId}</strong> — {row.transferDetails.reason}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: BILGEN_TOKENS.colors.textMuted }}>
                          İlk doğrudan kayıt
                        </span>
                      ),
                  },
                ]}
              />
            </div>
          )}

          {activeTab === 'ADMISSIONS' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Aday Yönetimi & Başvuru Süreci (Admissions & CRM)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                  Aday öğrenci yaşam döngüsü, normalleştirilmiş başvuru kaynakları ve görüşme geçmişi.
                </p>
              </div>

              <ExcelTable<{ id: string; name: string; source: string; program: string; status: string; date: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'lead-1',
                    name: 'Emre Çetin',
                    source: 'WEBSITE',
                    program: 'Fen Lisesi 9. Sınıf',
                    status: 'APPLICATION',
                    date: '2026-09-20',
                  },
                  {
                    id: 'lead-2',
                    name: 'Selin Yılmaz',
                    source: 'WALK_IN',
                    program: 'YKS Eşit Ağırlık Hazırlık',
                    status: 'OFFERED',
                    date: '2026-09-21',
                  },
                  {
                    id: 'lead-3',
                    name: 'Kaan Demir',
                    source: 'REFERRAL',
                    program: 'İngilizce B2 Yoğun Kur',
                    status: 'WON',
                    date: '2026-09-22',
                  },
                ]}
                columns={[
                  { key: 'name', header: 'Aday Ad Soyad', width: '160px' },
                  { key: 'source', header: 'Kanal / Kaynak', width: '120px' },
                  { key: 'program', header: 'İlgilenilen Program', width: '220px' },
                  {
                    key: 'status',
                    header: 'Aday Durumu',
                    width: '130px',
                    render: (row) => (
                      <StatusBadge
                        label={row.status}
                        variant={row.status === 'WON' ? 'success' : row.status === 'OFFERED' ? 'warning' : 'info'}
                      />
                    ),
                  },
                  { key: 'date', header: 'Kayıt Tarihi', width: '120px', isNumeric: true },
                ]}
              />
            </div>
          )}

          {activeTab === 'COMMERCIAL' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Ticari Kayıtlar & Eğitim Sözleşmeleri (Commercial Registration)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                  BilgenOS ticari/hukuki kayıt omurgası. BilgenOkul akademik kaydından bağımsızdır; aktivasyonu Phase 1 Enrollment kaydı üretmez.
                </p>
              </div>

              <ExcelTable<{ id: string; regNo: string; student: string; payer: string; contractVer: string; status: string; integration: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'creg-1',
                    regNo: 'REG-2026-0081',
                    student: 'Zeynep Aksoy',
                    payer: 'Murat Aksoy (Baba)',
                    contractVer: 'v2 (Zeyilname)',
                    status: 'ACTIVE',
                    integration: 'SYNCED',
                  },
                  {
                    id: 'creg-2',
                    regNo: 'REG-2026-0082',
                    student: 'Mert Yıldız',
                    payer: 'Fatma Yıldız (Anne)',
                    contractVer: 'v1 (İmzalandı)',
                    status: 'READY',
                    integration: 'PENDING',
                  },
                  {
                    id: 'creg-3',
                    regNo: 'REG-2026-0083',
                    student: 'Deniz Kaya',
                    payer: 'Ahmet Kaya (Veli)',
                    contractVer: 'v1 (Taslak)',
                    status: 'PENDING_PAYMENT_PLAN',
                    integration: 'NOT_REQUIRED',
                  },
                ]}
                columns={[
                  { key: 'regNo', header: 'Kayıt No', width: '140px', isNumeric: true },
                  { key: 'student', header: 'Öğrenen Kişi', width: '160px' },
                  { key: 'payer', header: 'Finansal Sorumlu (Payer)', width: '180px' },
                  { key: 'contractVer', header: 'Sözleşme Versiyonu', width: '150px' },
                  {
                    key: 'status',
                    header: 'Ticari Durum',
                    width: '130px',
                    render: (row) => (
                      <StatusBadge
                        label={row.status}
                        variant={row.status === 'ACTIVE' ? 'success' : row.status === 'READY' ? 'info' : 'warning'}
                      />
                    ),
                  },
                  {
                    key: 'integration',
                    header: 'BilgenOkul Durumu',
                    width: '140px',
                    render: (row) => (
                      <StatusBadge
                        label={row.integration}
                        variant={row.integration === 'SYNCED' ? 'success' : row.integration === 'PENDING' ? 'warning' : 'default'}
                      />
                    ),
                  },
                ]}
              />
            </div>
          )}

          {activeTab === 'PAYMENTS' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Ödeme Planları, Taksitler & Mutabakat (Financial Foundation)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                  Kuruş hassasiyetinde (`BigInt`) mutabakat: brüt - burs - indirim = net sözleşme tutarı = toplam taksit. Arbitrary PATCH status=PAID kesinlikle engellenmiştir.
                </p>
              </div>

              <ExcelTable<{ id: string; seq: string; dueDate: string; gross: string; discount: string; net: string; status: string }>
                keyExtractor={(row) => row.id}
                data={[
                  { id: 'p-1', seq: 'Taksit 1 / 3', dueDate: '2026-10-15', gross: '35.000,00 ₺', discount: '5.000,00 ₺', net: '30.000,00 ₺', status: 'PAID' },
                  { id: 'p-2', seq: 'Taksit 2 / 3', dueDate: '2026-11-15', gross: '35.000,00 ₺', discount: '5.000,00 ₺', net: '30.000,00 ₺', status: 'PENDING' },
                  { id: 'p-3', seq: 'Taksit 3 / 3', dueDate: '2026-12-15', gross: '35.000,00 ₺', discount: '5.000,00 ₺', net: '30.000,00 ₺', status: 'PENDING' },
                ]}
                columns={[
                  { key: 'seq', header: 'Taksit Sırası', width: '130px' },
                  { key: 'dueDate', header: 'Vade Tarihi', width: '120px', isNumeric: true },
                  { key: 'gross', header: 'Brüt Tutar', width: '130px', isNumeric: true },
                  { key: 'discount', header: 'Burs / İndirim', width: '130px', isNumeric: true },
                  { key: 'net', header: 'Net Taksit Tutarı', width: '140px', isNumeric: true },
                  {
                    key: 'status',
                    header: 'Tahsilat Durumu',
                    width: '130px',
                    render: (row) => (
                      <StatusBadge
                        label={row.status}
                        variant={row.status === 'PAID' ? 'success' : 'default'}
                      />
                    ),
                  },
                ]}
              />
            </div>
          )}

          {activeTab === 'INTEGRATION' && (
            <div>
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  backgroundColor: '#FFF4E5',
                  border: '1px solid #FFE0B2',
                  fontSize: '12px',
                  color: '#B76E00',
                  fontFamily: BILGEN_TOKENS.typography.fontFamilyMono,
                  fontWeight: 600,
                }}
              >
                TRANSPORT STATUS: BILGENOKUL LIVE INTEGRATION — BLOCKED BY API DOCUMENTATION
                <div style={{ fontWeight: 400, marginTop: '4px', color: '#555' }}>
                  Provider adapter arayüzü ve Anti-Corruption Layer (ACL) aktiftir. Gerçek API dokümantasyonu gelene kadar test/mock provider çalışmaktadır; uydurma endpoint açılmamıştır.
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  BilgenOkul Harici Varlık Eşleştirmeleri (External Entity Mappings)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                  BilgenOS Person kimliği ile BilgenOkul Academic Student kimliği arasındaki generic eşleştirme tablosu.
                </p>
              </div>

              <ExcelTable<{ id: string; localId: string; externalId: string; provider: string; status: string; lastSync: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'map-1',
                    localId: 'person-99120 (Zeynep)',
                    externalId: 'BOKUL-STU-884102',
                    provider: 'BILGEN_OKUL',
                    status: 'SYNCED',
                    lastSync: '2026-09-23 03:00:00',
                  },
                  {
                    id: 'map-2',
                    localId: 'person-99121 (Mert)',
                    externalId: 'BOKUL-STU-884103',
                    provider: 'BILGEN_OKUL',
                    status: 'SYNCED',
                    lastSync: '2026-09-23 03:01:15',
                  },
                ]}
                columns={[
                  { key: 'localId', header: 'BilgenOS Yerel Varlık', width: '200px' },
                  { key: 'externalId', header: 'BilgenOkul Harici Varlık ID', width: '200px', isNumeric: true },
                  { key: 'provider', header: 'Entegrasyon Sağlayıcı', width: '160px' },
                  {
                    key: 'status',
                    header: 'Senkronizasyon',
                    width: '130px',
                    render: (row) => (
                      <StatusBadge label={row.status} variant="success" />
                    ),
                  },
                  { key: 'lastSync', header: 'Son Senkron Zamanı', width: '160px', isNumeric: true },
                ]}
              />
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Güvenlik, İzolasyon & Denetim İzi (Audit Foundation)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                  Tüm yetki ihlalleri ve cross-tenant girişimleri bu günlüğe kaydedilir; dış API resource existence sızdırmamak için 404 maskelemesi uygular.
                </p>
              </div>

              <ExcelTable<{ id: string; time: string; action: string; decision: string; detail: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'aud-1',
                    time: '2026-09-23 02:27:07',
                    action: 'person.read',
                    decision: 'ALLOW',
                    detail: 'Tenant A legitimate access to Person A',
                  },
                  {
                    id: 'aud-2',
                    time: '2026-09-23 02:27:08',
                    action: 'person.read',
                    decision: 'DENY',
                    detail: 'Cross-tenant probe detected. Masked as 404 (Resource Not Found).',
                  },
                  {
                    id: 'aud-3',
                    time: '2026-09-23 02:27:08',
                    action: 'learner.update',
                    decision: 'DENY',
                    detail: 'Cross-tenant mutation rejected by Scoped Repository.',
                  },
                ]}
                columns={[
                  { key: 'time', header: 'Zaman Damgası', width: '160px', isNumeric: true },
                  { key: 'action', header: 'Eylem / İzin', width: '140px' },
                  {
                    key: 'decision',
                    header: 'Karar',
                    width: '100px',
                    render: (row) => (
                      <StatusBadge
                        label={row.decision}
                        variant={row.decision === 'ALLOW' ? 'success' : 'danger'}
                      />
                    ),
                  },
                  { key: 'detail', header: 'Güvenlik ve İzolasyon Detayı' },
                ]}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
