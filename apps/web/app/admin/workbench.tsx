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
  | 'FINANCE_ACCOUNTS'
  | 'COLLECTIONS'
  | 'LEDGER'
  | 'RECONCILIATION'
  | 'CAPABILITIES'
  | 'AUDIT'
  | 'PERSONNEL'
  | 'ASSIGNMENTS'
  | 'LEAVES'
  | 'ATTENDANCE'
  | 'PHYSICAL_SPACES'
  | 'ASSETS'
  | 'ASSET_CUSTODY'
  | 'ASSET_TRANSFERS'
  | 'TRANSPORT_ROUTES'
  | 'TRANSPORT_FLEET'
  | 'TRANSPORT_PASSENGERS'
  | 'TRANSPORT_TRIPS';

export function CoreAdministrationWorkbench(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ActiveTab>('CAPABILITIES');

  // Phase 5 Campus, Physical Spaces & Asset Seed Data
  const [physicalSpaces] = useState([
    {
      id: 'sp-101',
      campus: 'Merkez Kampüs',
      building: 'A Blok (Fen ve İdare Binası)',
      floor: '2. Kat',
      code: 'A-204',
      name: 'Fizik & Robotik Laboratuvarı',
      spaceType: 'LABORATORY',
      capacity: 32,
      area: '84 m²',
      status: 'ACTIVE',
      assetCount: 18,
    },
    {
      id: 'sp-102',
      campus: 'Merkez Kampüs',
      building: 'A Blok (Fen ve İdare Binası)',
      floor: '1. Kat',
      code: 'A-108',
      name: 'Akademik Zümre Odası (Sayısal)',
      spaceType: 'OFFICE',
      capacity: 12,
      area: '45 m²',
      status: 'ACTIVE',
      assetCount: 14,
    },
    {
      id: 'sp-103',
      campus: 'Merkez Kampüs',
      building: 'B Blok (Konferans & Spor)',
      floor: 'Zemin Kat',
      code: 'B-Z01',
      name: 'Büyük Konferans & Gösteri Salonu',
      spaceType: 'OTHER',
      capacity: 350,
      area: '420 m²',
      status: 'ACTIVE',
      assetCount: 22,
    },
    {
      id: 'sp-104',
      campus: 'Kızılay Kampüsü',
      building: 'YKS Hazırlık Ana Bina',
      floor: '3. Kat',
      code: 'K-302',
      name: '302 Nolu Seminer Odası',
      spaceType: 'CLASSROOM',
      capacity: 24,
      area: '52 m²',
      status: 'TEMPORARILY_UNAVAILABLE',
      assetCount: 6,
    },
  ]);

  const [assets] = useState([
    {
      id: 'ast-101',
      assetNumber: 'AST-2026-000042',
      assetTag: 'BGN-IT-0042',
      name: 'Apple MacBook Pro 16" M3 Max',
      category: 'Bilişim & IT Ekipmanı',
      manufacturer: 'Apple',
      model: 'MacBook Pro 16',
      serialNumber: 'C02G9012MD6R',
      location: 'Merkez Kampüs / A Blok / 1. Kat / A-108',
      custodian: 'Ahmet Faruk Yılmaz (Fizik Zümre Bşk.)',
      condition: 'GOOD',
      status: 'IN_USE',
      warrantyEndDate: '2027-09-01',
      warrantyStatus: 'ACTIVE',
    },
    {
      id: 'ast-102',
      assetNumber: 'AST-2026-000043',
      assetTag: 'BGN-IT-0043',
      name: 'Lenovo ThinkPad P16 Gen 2',
      category: 'Bilişim & IT Ekipmanı',
      manufacturer: 'Lenovo',
      model: 'ThinkPad P16',
      serialNumber: 'PF3X8921',
      location: 'Merkez Kampüs / A Blok / 1. Kat / A-108',
      custodian: 'Zeynep Kaya Çelik (Matematik Öğrt.)',
      condition: 'NEW',
      status: 'IN_USE',
      warrantyEndDate: '2027-11-15',
      warrantyStatus: 'ACTIVE',
    },
    {
      id: 'ast-103',
      assetNumber: 'AST-2026-000088',
      assetTag: 'BGN-LAB-0012',
      name: 'Leica DM500 Dijital Araştırma Mikroskobu',
      category: 'Laboratuvar & Deney Ekipmanı',
      manufacturer: 'Leica Microsystems',
      model: 'DM500',
      serialNumber: 'LC-99412',
      location: 'Merkez Kampüs / A Blok / 2. Kat / A-204',
      custodian: 'Demirbaş Sorumlusu (Fen Bölümü)',
      condition: 'GOOD',
      status: 'AVAILABLE',
      warrantyEndDate: '2028-01-20',
      warrantyStatus: 'ACTIVE',
    },
    {
      id: 'ast-104',
      assetNumber: 'AST-2026-000105',
      assetTag: 'BGN-AV-0005',
      name: 'Epson EB-PU2220B Lazer Projeksiyon (20.000 Lümen)',
      category: 'Ses & Görüntü Ekipmanı',
      manufacturer: 'Epson',
      model: 'EB-PU2220B',
      serialNumber: 'EP-441209',
      location: 'Merkez Kampüs / B Blok / Zemin Kat / B-Z01',
      custodian: 'Teknik Hizmetler Masası',
      condition: 'FAIR',
      status: 'IN_REPAIR',
      warrantyEndDate: '2025-06-01',
      warrantyStatus: 'EXPIRED',
    },
  ]);

  const [assetCustodies] = useState([
    {
      id: 'cst-01',
      employeeName: 'Ahmet Faruk Yılmaz',
      employeeNumber: 'EMP-2026-0042',
      institution: 'Bilgen Fen ve Anadolu Lisesi',
      assetNumber: 'AST-2026-000042',
      assetName: 'Apple MacBook Pro 16" M3 Max',
      assignedAt: '2024-09-01 09:30',
      returnedAt: '-',
      status: 'ACTIVE',
      assignedBy: 'Mehmet Akif Demir (BT Direktörü)',
      notes: 'Zümre başkanlığı akademik geliştirme ve robotik laboratuvar koordinasyonu için zimmetlendi.',
    },
    {
      id: 'cst-02',
      employeeName: 'Zeynep Kaya Çelik',
      employeeNumber: 'EMP-2026-0089',
      institution: 'Bilgen Fen ve Anadolu Lisesi',
      assetNumber: 'AST-2026-000043',
      assetName: 'Lenovo ThinkPad P16 Gen 2',
      assignedAt: '2024-11-20 14:15',
      returnedAt: '-',
      status: 'ACTIVE',
      assignedBy: 'Mehmet Akif Demir (BT Direktörü)',
      notes: 'Matematik zümresi dijital içerik hazırlama için tahsis edildi.',
    },
  ]);

  const [assetTransfers] = useState([
    {
      id: 'trf-101',
      transferNumber: 'TRF-2026-00012',
      assetNumber: 'AST-2026-000065',
      assetName: 'BenQ RP8602K 86" İnteraktif Akıllı Tahta',
      fromLocation: 'Merkez Kampüs / A Blok / A-102',
      toLocation: 'Kızılay Kampüsü / YKS Ana Bina / K-302',
      requestedBy: 'Dr. Selim Candan (YKS Danışmanı)',
      approvedBy: 'Kemalettin Bilgen (Genel Müdür)',
      status: 'COMPLETED',
      requestedAt: '2026-09-18 10:00',
      completedAt: '2026-09-19 16:30',
      reason: 'YKS Hazırlık Merkezi yeni seminer sınıfı donatımı',
    },
    {
      id: 'trf-102',
      transferNumber: 'TRF-2026-00013',
      assetNumber: 'AST-2026-000105',
      assetName: 'Epson EB-PU2220B Lazer Projeksiyon',
      fromLocation: 'Merkez Kampüs / B Blok / B-Z01',
      toLocation: 'Çankaya Kampüsü / Yabancı Dil Konferans',
      requestedBy: 'Teknik Servis Sorumlusu',
      approvedBy: 'BEKLEMEDE (Maker-Checker)',
      status: 'REQUESTED',
      requestedAt: '2026-09-24 15:45',
      completedAt: '-',
      reason: 'Bölge konferansı sunumu için geçici transfer talebi',
    },
  ]);

    // Phase 4 HR & Workforce Seed Data (Excel-grade Corporate)
  const [employees] = useState([
    {
      id: 'emp-101',
      employeeNumber: 'EMP-2026-0042',
      nationalId: '10293847561',
      fullName: 'Ahmet Faruk Yılmaz',
      department: 'Fen Bilimleri Bölümü',
      position: 'Fizik Bölüm Başkanı',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      joinedAt: '2022-09-01',
      totalAllocation: '100%',
      documentStatus: 'VERIFIED (3/3)',
      bilgenOkulMapped: true,
      bilgenOkulTeacherId: 'TC-BO-8831',
    },
    {
      id: 'emp-102',
      employeeNumber: 'EMP-2026-0089',
      nationalId: '98765432109',
      fullName: 'Zeynep Kaya Çelik',
      department: 'Matematik Bölümü',
      position: 'Matematik Öğretmeni',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      joinedAt: '2024-02-15',
      totalAllocation: '100%',
      documentStatus: 'VERIFIED (2/2)',
      bilgenOkulMapped: true,
      bilgenOkulTeacherId: 'TC-BO-9042',
    },
    {
      id: 'emp-103',
      employeeNumber: 'EMP-2026-0115',
      nationalId: '45678912301',
      fullName: 'Dr. Selim Candan',
      department: 'Ölçme ve Değerlendirme',
      position: 'YKS Akademik Danışmanı',
      employmentType: 'PART_TIME',
      status: 'ACTIVE',
      joinedAt: '2025-08-01',
      totalAllocation: '70%',
      documentStatus: 'PENDING_AUDIT (1/2)',
      bilgenOkulMapped: false,
      bilgenOkulTeacherId: '-',
    },
  ]);

  const [assignments] = useState([
    {
      id: 'asg-01',
      employeeName: 'Ahmet Faruk Yılmaz',
      institution: 'Bilgen Fen ve Anadolu Lisesi',
      campus: 'Merkez Kampüs',
      department: 'Fen Bilimleri',
      position: 'Fizik Bölüm Başkanı',
      workPercentage: '80%',
      isPrimary: true,
      startDate: '2022-09-01',
      status: 'ACTIVE',
    },
    {
      id: 'asg-02',
      employeeName: 'Ahmet Faruk Yılmaz',
      institution: 'Bilgen YKS Hazırlık Merkezi',
      campus: 'Kızılay Kampüsü',
      department: 'Fen Bilimleri',
      position: 'YKS Fizik Baş Danışmanı',
      workPercentage: '20%',
      isPrimary: false,
      startDate: '2023-09-01',
      status: 'ACTIVE',
    },
    {
      id: 'asg-03',
      employeeName: 'Dr. Selim Candan',
      institution: 'Bilgen Fen ve Anadolu Lisesi',
      campus: 'Merkez Kampüs',
      department: 'Ölçme & Değerlendirme',
      position: 'YKS Danışmanı',
      workPercentage: '40%',
      isPrimary: true,
      startDate: '2025-08-01',
      status: 'ACTIVE',
    },
    {
      id: 'asg-04',
      employeeName: 'Dr. Selim Candan',
      institution: 'Bilgen Yabancı Dil Akademisi',
      campus: 'Çankaya Kampüsü',
      department: 'Yabancı Dil',
      position: 'Akademik Danışman',
      workPercentage: '30%',
      isPrimary: false,
      startDate: '2025-09-01',
      status: 'ACTIVE',
    },
  ]);

  const [leaves] = useState([
    {
      id: 'lv-01',
      employeeName: 'Zeynep Kaya Çelik',
      leaveType: 'ANNUAL (Yıllık İzin)',
      startDate: '2026-07-06',
      endDate: '2026-07-17',
      totalDays: 10,
      maker: 'Zeynep Kaya Çelik (Başvuran)',
      checker: 'Ahmet Faruk Yılmaz (Bölüm Bşk.)',
      status: 'APPROVED',
      remainingBalance: '14 Gün',
      appliedAt: '2026-06-15 11:20',
    },
    {
      id: 'lv-02',
      employeeName: 'Ahmet Faruk Yılmaz',
      leaveType: 'CASUAL (Mazeret İzni)',
      startDate: '2026-09-25',
      endDate: '2026-09-25',
      totalDays: 1,
      maker: 'Ahmet Faruk Yılmaz (Başvuran)',
      checker: 'Genel Müdürlük (İK Direktörü)',
      status: 'SUBMITTED',
      remainingBalance: '4 Gün',
      appliedAt: '2026-09-22 16:40',
    },
  ]);

  const [attendanceSessions] = useState([
    {
      id: 'att-101',
      employeeName: 'Ahmet Faruk Yılmaz',
      date: '2026-09-22',
      firstIn: '07:54:12',
      lastOut: '17:32:05',
      grossMinutes: 578,
      breakMinutes: 45,
      netWorkedMinutes: 533,
      netWorkedFormatted: '8 sa 53 dk',
      status: 'PRESENT',
      discrepancy: 'YOK (Zamanında)',
      verificationDevice: 'MERKEZ-TURNIKE-01 (RFID/Biyometrik)',
    },
    {
      id: 'att-102',
      employeeName: 'Zeynep Kaya Çelik',
      date: '2026-09-22',
      firstIn: '08:18:40',
      lastOut: '17:05:18',
      grossMinutes: 527,
      breakMinutes: 45,
      netWorkedMinutes: 482,
      netWorkedFormatted: '8 sa 02 dk',
      status: 'PRESENT',
      discrepancy: '18 dk Geç Giriş',
      verificationDevice: 'MERKEZ-TURNIKE-02 (Biyometrik)',
    },
    {
      id: 'att-103',
      employeeName: 'Dr. Selim Candan',
      date: '2026-09-22',
      firstIn: '09:02:10',
      lastOut: '14:30:22',
      grossMinutes: 328,
      breakMinutes: 30,
      netWorkedMinutes: 298,
      netWorkedFormatted: '4 sa 58 dk',
      status: 'PARTIAL',
      discrepancy: 'Yarı Zamanlı Program Uyumlu',
      verificationDevice: 'KIZILAY-GIRIS-01 (RFID)',
    },
  ]);

    // Phase 3 Finance Seed Data (Excel-grade Light Corporate)
  const [financialAccounts] = useState([
    {
      id: 'acc-1',
      name: 'Garanti BBVA Ana Tahsilat Hesabı',
      accountType: 'BANK',
      currency: 'TRY',
      accountNumber: '****3821',
      iban: 'TR** **** **** **** **** **38 21',
      bankName: 'Garanti BBVA',
      branchName: 'Levent Kurumsal',
      projectedBalance: '1.250.000,00 ₺',
      isActive: true,
    },
    {
      id: 'acc-2',
      name: 'Merkez Kampüs Muhasebe Kasası',
      accountType: 'CASH',
      currency: 'TRY',
      accountNumber: 'KASA-01',
      iban: '-',
      bankName: '-',
      branchName: '-',
      projectedBalance: '48.500,00 ₺',
      isActive: true,
    },
    {
      id: 'acc-3',
      name: 'İyzico Sanal POS Takas Hesabı',
      accountType: 'CARD_CLEARING',
      currency: 'TRY',
      accountNumber: 'POS-CLEAR-01',
      iban: '-',
      bankName: 'İyzico / Akbank',
      branchName: 'Online Gateway',
      projectedBalance: '420.000,00 ₺',
      isActive: true,
    },
  ]);

  const [collections] = useState([
    {
      id: 'col-101',
      referenceNumber: 'TAH-2026-00084',
      financialResponsible: 'Mehmet Yılmaz (Veli)',
      accountName: 'Garanti BBVA Ana Tahsilat',
      paymentMethod: 'BANK_TRANSFER',
      amountFormatted: '120.000,00 ₺',
      allocatedFormatted: '120.000,00 ₺',
      unallocatedFormatted: '0,00 ₺',
      status: 'CONFIRMED',
      allocationState: 'FULLY_ALLOCATED',
      receiptNumber: 'MKB-2026-00101',
      collectedAt: '2026-09-22 14:30',
    },
    {
      id: 'col-102',
      referenceNumber: 'TAH-2026-00085',
      financialResponsible: 'Ayşe Demir (Veli)',
      accountName: 'Merkez Kampüs Muhasebe Kasası',
      paymentMethod: 'CASH',
      amountFormatted: '35.000,00 ₺',
      allocatedFormatted: '25.000,00 ₺',
      unallocatedFormatted: '10.000,00 ₺',
      status: 'CONFIRMED',
      allocationState: 'PARTIALLY_ALLOCATED',
      receiptNumber: 'MKB-2026-00102',
      collectedAt: '2026-09-22 15:10',
    },
    {
      id: 'col-103',
      referenceNumber: 'TAH-2026-00086',
      financialResponsible: 'Burak Kaya (Veli)',
      accountName: 'İyzico Sanal POS Takas',
      paymentMethod: 'CREDIT_CARD',
      amountFormatted: '60.000,00 ₺',
      allocatedFormatted: '0,00 ₺',
      unallocatedFormatted: '60.000,00 ₺',
      status: 'PENDING',
      allocationState: 'UNALLOCATED',
      receiptNumber: 'BEKLEMEDE',
      collectedAt: '2026-09-23 09:15',
    },
  ]);

  const [ledgerEntries] = useState([
    {
      id: 'led-1',
      entryNumber: '00000001',
      accountName: 'Garanti BBVA Ana Tahsilat',
      entryType: 'MONEY_IN',
      amountFormatted: '+120.000,00 ₺',
      sourceType: 'COLLECTION',
      reference: 'TAH-2026-00084',
      description: 'Öğrenci Yıllık Eğitim Taksit Tahsilatı',
      isReversed: false,
      postedAt: '2026-09-22 14:30:12',
    },
    {
      id: 'led-2',
      entryNumber: '00000002',
      accountName: 'Merkez Kampüs Muhasebe Kasası',
      entryType: 'MONEY_IN',
      amountFormatted: '+35.000,00 ₺',
      sourceType: 'COLLECTION',
      reference: 'TAH-2026-00085',
      description: 'Nakit Peşinat Tahsilatı',
      isReversed: false,
      postedAt: '2026-09-22 15:10:05',
    },
    {
      id: 'led-3',
      entryNumber: '00000003',
      accountName: 'Merkez Kampüs Muhasebe Kasası',
      entryType: 'MONEY_OUT',
      amountFormatted: '-5.000,00 ₺',
      sourceType: 'REFUND',
      reference: 'REF-2026-00012',
      description: 'Kayıt İptali / Fazla Tahsilat İadesi (Maker-Checker Onaylı)',
      isReversed: false,
      postedAt: '2026-09-22 16:45:00',
    },
  ]);

  const [reconciliationSessions] = useState([
    {
      id: 'rec-1',
      accountName: 'Garanti BBVA Ana Tahsilat',
      sourceType: 'BANK',
      sessionDate: '2026-09-22',
      externalClosing: '1.250.000,00 ₺',
      ledgerClosing: '1.250.000,00 ₺',
      discrepancy: '0,00 ₺',
      status: 'MATCHED',
    },
    {
      id: 'rec-2',
      accountName: 'İyzico Sanal POS Takas Hesabı',
      sourceType: 'CARD',
      sessionDate: '2026-09-22',
      externalClosing: '422.500,00 ₺',
      ledgerClosing: '420.000,00 ₺',
      discrepancy: '+2.500,00 ₺',
      status: 'DISCREPANCY',
    },
  ]);

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
    { id: 'INTEGRATION', label: '9. BilgenOkul Entegrasyon Merkezi' },
    { id: 'FINANCE_ACCOUNTS', label: '10. Kasa & Banka Hesapları' },
    { id: 'COLLECTIONS', label: '11. Tahsilat & Borç Mahsubu' },
    { id: 'LEDGER', label: '12. Operasyonel Defter (Journal)' },
    { id: 'RECONCILIATION', label: '13. Finansal Mutabakat & İade' },
    { id: 'AUDIT', label: '14. Güvenlik & Denetim İzi' },
    { id: 'PERSONNEL', label: '15. Personel Listesi & Özlük' },
    { id: 'ASSIGNMENTS', label: '16. İstihdam & Görevlendirme' },
    { id: 'LEAVES', label: '17. İzin & Mazeret Yönetimi' },
    { id: 'ATTENDANCE', label: '18. Personel Devam & Puantaj' },
    { id: 'PHYSICAL_SPACES', label: '19. Fiziksel Yapı & Mekanlar' },
    { id: 'ASSETS', label: '20. Demirbaş & Varlık Yönetimi' },
    { id: 'ASSET_CUSTODY', label: '21. Zimmet & Sorumluluk' },
    { id: 'ASSET_TRANSFERS', label: '22. Varlık Transferleri' },
    { id: 'TRANSPORT_ROUTES', label: '23. Servis Güzergah & Duraklar' },
    { id: 'TRANSPORT_FLEET', label: '24. Araç Filosu & Sürücüler' },
    { id: 'TRANSPORT_PASSENGERS', label: '25. Servis Yolcu Listesi & Zimmet' },
    { id: 'TRANSPORT_TRIPS', label: '26. Canlı Sefer Takibi & Güvenli Teslimat' },
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

          {activeTab === 'FINANCE_ACCOUNTS' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Operasyonel Para Hesapları (Financial Accounts)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Banka, Kasa ve POS takas hesapları. Bakiye mutable sütun değildir; Defter (Ledger) projeksiyonundan anlık türetilir.
                  </p>
                </div>
                <StatusBadge label="IBAN MASKING: ACTIVE" variant="success" />
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={financialAccounts}
                columns={[
                  { key: 'name', header: 'Hesap Adı', width: '220px' },
                  { key: 'accountType', header: 'Hesap Türü', width: '130px', render: (row: any) => <StatusBadge label={row.accountType} variant="default" /> },
                  { key: 'bankName', header: 'Banka / Sağlayıcı', width: '150px' },
                  { key: 'iban', header: 'Maskelenmiş IBAN (Protected)', width: '220px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, fontSize: '12px' }}>{row.iban}</span> },
                  { key: 'projectedBalance', header: 'Türetilmiş Bakiye (Ledger Projection)', width: '180px', render: (row: any) => <strong style={{ color: BILGEN_TOKENS.colors.accent, fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.projectedBalance}</strong> },
                  { key: 'status', header: 'Durum', width: '90px', render: () => <StatusBadge label="AKTİF" variant="success" /> },
                ]}
              />
            </div>
          )}

          {activeTab === 'COLLECTIONS' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Tahsilat & Borç Mahsubu (Collections & Payment Allocations)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Para Korunumu: Tahsilat Tutarı = Mahsup Edilen + Açıkta Kalan. Taksit statüsü doğrudan PATCH edilemez.
                  </p>
                </div>
                <StatusBadge label="MONEY CONSERVATION: VERIFIED" variant="success" />
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={collections}
                columns={[
                  { key: 'referenceNumber', header: 'Tahsilat No', width: '130px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, fontWeight: 600 }}>{row.referenceNumber}</span> },
                  { key: 'financialResponsible', header: 'Mali Sorumlu', width: '160px' },
                  { key: 'accountName', header: 'Giriş Hesabı', width: '190px' },
                  { key: 'amountFormatted', header: 'Tahsil Tutarı', width: '130px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.amountFormatted}</strong> },
                  { key: 'allocatedFormatted', header: 'Mahsup Edilen', width: '120px' },
                  { key: 'unallocatedFormatted', header: 'Açıkta Kalan', width: '120px' },
                  { key: 'allocationState', header: 'Mahsup Durumu', width: '140px', render: (row: any) => <StatusBadge label={row.allocationState} variant={row.allocationState === 'FULLY_ALLOCATED' ? 'success' : row.allocationState === 'PARTIALLY_ALLOCATED' ? 'warning' : 'default'} /> },
                  { key: 'status', header: 'Doğrulama', width: '110px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'CONFIRMED' ? 'success' : 'warning'} /> },
                  { key: 'receiptNumber', header: 'Makbuz No', width: '130px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, fontSize: '11px' }}>{row.receiptNumber}</span> },
                ]}
              />
            </div>
          )}

          {activeTab === 'LEDGER' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Operasyonel Defter (Financial Ledger — Immutable Money Journal)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Kayıtlar salt-eklemelidir (append-only); güncelleme ve silme yasaktır. Düzeltmeler ters yevmiye maddesiyle işletilir.
                  </p>
                </div>
                <StatusBadge label="IMMUTABLE JOURNAL: ENFORCED" variant="success" />
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={ledgerEntries}
                columns={[
                  { key: 'entryNumber', header: 'Madde No', width: '100px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, fontWeight: 700 }}>#{row.entryNumber}</span> },
                  { key: 'postedAt', header: 'Kayıt Zamanı', width: '150px' },
                  { key: 'accountName', header: 'Hesap', width: '190px' },
                  { key: 'entryType', header: 'Yön', width: '100px', render: (row: any) => <StatusBadge label={row.entryType} variant={row.entryType === 'MONEY_IN' ? 'success' : 'danger'} /> },
                  { key: 'amountFormatted', header: 'Tutar', width: '130px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, color: row.entryType === 'MONEY_IN' ? BILGEN_TOKENS.colors.success : BILGEN_TOKENS.colors.danger }}>{row.amountFormatted}</strong> },
                  { key: 'sourceType', header: 'Kaynak Türü', width: '120px' },
                  { key: 'reference', header: 'Referans No', width: '140px' },
                  { key: 'description', header: 'Açıklama' },
                ]}
              />
            </div>
          )}

          {activeTab === 'RECONCILIATION' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Finansal Mutabakat & İade Yönetimi (Reconciliation & Refunds)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Dış hesap ekstresi ile defter mutabakatı. Belirsiz (Ambiguous) kayıtlar otomatik kapatılamaz, denetime sevk edilir.
                  </p>
                </div>
                <StatusBadge label="MAKER-CHECKER: ENFORCED" variant="success" />
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={reconciliationSessions}
                columns={[
                  { key: 'accountName', header: 'Hesap Adı', width: '220px' },
                  { key: 'sourceType', header: 'Kaynak Türü', width: '120px', render: (row: any) => <StatusBadge label={row.sourceType} variant="default" /> },
                  { key: 'sessionDate', header: 'Dönem Tarihi', width: '110px' },
                  { key: 'externalClosing', header: 'Dış Ekstre Bakiye', width: '140px' },
                  { key: 'ledgerClosing', header: 'Defter Kapanış Bakiye', width: '140px' },
                  { key: 'discrepancy', header: 'Fark (Discrepancy)', width: '130px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, color: row.discrepancy === '0,00 ₺' ? BILGEN_TOKENS.colors.success : BILGEN_TOKENS.colors.danger, fontWeight: 700 }}>{row.discrepancy}</span> },
                  { key: 'status', header: 'Mutabakat Durumu', width: '130px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'MATCHED' ? 'success' : 'warning'} /> },
                ]}
              />
            </div>
          )}

          {activeTab === 'PERSONNEL' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Personel Listesi & Özlük Dosyası (Workforce Master)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    HR Master Otoritesi BilgenOS'tur. Kimlik ve çalışan profili ayrı katmandır (Person ≠ EmployeeProfile). Özlük belgeleri gizlilik sınıflandırmasına tabidir.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <StatusBadge label="HR MASTER: BILGEN_OS" variant="success" />
                  <StatusBadge label="BILGENOKUL MAPPING: ACTIVE" variant="default" />
                </div>
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={employees}
                columns={[
                  { key: 'employeeNumber', header: 'Sicil No', width: '130px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.employeeNumber}</strong> },
                  { key: 'fullName', header: 'Ad Soyad', width: '180px' },
                  { key: 'nationalId', header: 'T.C. Kimlik No', width: '120px' },
                  { key: 'department', header: 'Departman', width: '170px' },
                  { key: 'position', header: 'Pozisyon / Unvan', width: '170px' },
                  { key: 'employmentType', header: 'Çalışma Tipi', width: '110px', render: (row: any) => <StatusBadge label={row.employmentType} variant="default" /> },
                  { key: 'totalAllocation', header: 'Toplam Efor %', width: '100px', render: (row: any) => <strong style={{ color: BILGEN_TOKENS.colors.accent }}>{row.totalAllocation}</strong> },
                  { key: 'status', header: 'Durum', width: '90px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'ACTIVE' ? 'success' : 'warning'} /> },
                  { key: 'documentStatus', header: 'Özlük Evrakları', width: '140px' },
                  { key: 'bilgenOkulTeacherId', header: 'BilgenOkul Eşleme', width: '140px', render: (row: any) => row.bilgenOkulMapped ? <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, fontSize: '11px', color: BILGEN_TOKENS.colors.success }}>✓ {row.bilgenOkulTeacherId}</span> : <span style={{ color: BILGEN_TOKENS.colors.textMuted, fontSize: '11px' }}>Eşlenmedi</span> },
                ]}
              />
            </div>
          )}

          {activeTab === 'ASSIGNMENTS' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    İstihdam & Çoklu Kurum Görevlendirmeleri (Multi-Institution Allocation)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    İstihdam tüzel sözleşmedir; Görevlendirme ise operasyonel kurum/kampüs dağılımıdır. Bir personelin toplam çalışma oranı %100'ü aşamaz (HR-003).
                  </p>
                </div>
                <StatusBadge label="ALLOCATION CAP: ≤100% ENFORCED" variant="success" />
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={assignments}
                columns={[
                  { key: 'employeeName', header: 'Personel Adı', width: '180px' },
                  { key: 'institution', header: 'Görevli Olduğu Kurum', width: '220px' },
                  { key: 'campus', header: 'Kampüs', width: '140px' },
                  { key: 'department', header: 'Bölüm', width: '160px' },
                  { key: 'position', header: 'Pozisyon', width: '170px' },
                  { key: 'workPercentage', header: 'Efor Oranı', width: '100px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, color: BILGEN_TOKENS.colors.accent }}>{row.workPercentage}</strong> },
                  { key: 'isPrimary', header: 'Asli Görev?', width: '100px', render: (row: any) => row.isPrimary ? <StatusBadge label="ASLİ" variant="success" /> : <StatusBadge label="EK GÖREV" variant="default" /> },
                  { key: 'startDate', header: 'Başlangıç', width: '110px' },
                  { key: 'status', header: 'Durum', width: '90px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
                ]}
              />
            </div>
          )}

          {activeTab === 'LEAVES' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    İzin & Mazeret Yönetimi (Maker-Checker & Leave Ledger)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    İzinler muhakkak onay akışına (Maker-Checker) tabidir; başvuran kendi iznini onaylayamaz (HR-007). Kalan bakiye bakiye defterinden (LeaveTransaction) hesaplanır.
                  </p>
                </div>
                <StatusBadge label="MAKER-CHECKER: ENFORCED" variant="success" />
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={leaves}
                columns={[
                  { key: 'employeeName', header: 'Personel', width: '170px' },
                  { key: 'leaveType', header: 'İzin Türü', width: '160px' },
                  { key: 'startDate', header: 'Başlangıç', width: '110px' },
                  { key: 'endDate', header: 'Bitiş', width: '110px' },
                  { key: 'totalDays', header: 'Süre (Gün)', width: '90px', isNumeric: true },
                  { key: 'maker', header: 'Talep Eden (Maker)', width: '180px' },
                  { key: 'checker', header: 'Onaylayan (Checker)', width: '180px' },
                  { key: 'remainingBalance', header: 'Kalan Bakiye', width: '110px', render: (row: any) => <strong style={{ color: BILGEN_TOKENS.colors.accent }}>{row.remainingBalance}</strong> },
                  { key: 'status', header: 'Durum', width: '110px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'APPROVED' ? 'success' : 'warning'} /> },
                  { key: 'appliedAt', header: 'Talep Zamanı', width: '140px' },
                ]}
              />
            </div>
          )}

          {activeTab === 'ATTENDANCE' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Personel Devam & Puantaj Doğrulama (Attendance Sessions)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Ham giriş-çıkış olayları (AttendanceEvent) değiştirilemez kanıtlardır. Günlük seans ve net çalışma dakikaları türetilmiş projeksiyondur (HR-005).
                  </p>
                </div>
                <StatusBadge label="EMPIRICAL PUNCH AUDIT: ON" variant="success" />
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={attendanceSessions}
                columns={[
                  { key: 'employeeName', header: 'Personel', width: '170px' },
                  { key: 'date', header: 'Tarih', width: '100px' },
                  { key: 'firstIn', header: 'İlk Giriş', width: '90px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.firstIn}</span> },
                  { key: 'lastOut', header: 'Son Çıkış', width: '90px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.lastOut}</span> },
                  { key: 'breakMinutes', header: 'Mola', width: '70px', render: (row: any) => <span>{row.breakMinutes} dk</span> },
                  { key: 'netWorkedFormatted', header: 'Net Çalışma', width: '110px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, color: BILGEN_TOKENS.colors.success }}>{row.netWorkedFormatted}</strong> },
                  { key: 'discrepancy', header: 'Vardiya Sapması', width: '160px', render: (row: any) => <span style={{ color: row.discrepancy.includes('Geç') ? BILGEN_TOKENS.colors.danger : BILGEN_TOKENS.colors.textSecondary }}>{row.discrepancy}</span> },
                  { key: 'verificationDevice', header: 'Doğrulama Terminali', width: '220px' },
                  { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'PRESENT' ? 'success' : 'default'} /> },
                ]}
              />
            </div>
          )}

          {activeTab === 'PHYSICAL_SPACES' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Fiziksel Yapı & Mekanlar (Physical Hierarchy: Campus → Building → Floor → Space)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Mekan (Space) operasyonel fiziksel odadır; akademik derslik değildir (PHY-006). Müfredat ve şube bilgisi taşımaz.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <StatusBadge label="HIERARCHY: CANONICAL" variant="success" />
                  <StatusBadge label="SPACE ≠ ACADEMIC CLASSROOM" variant="default" />
                </div>
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={physicalSpaces}
                columns={[
                  { key: 'code', header: 'Mekan Kodu', width: '100px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.code}</strong> },
                  { key: 'name', header: 'Mekan Tanımı', width: '220px' },
                  { key: 'campus', header: 'Kampüs', width: '140px' },
                  { key: 'building', header: 'Bina', width: '200px' },
                  { key: 'floor', header: 'Kat', width: '90px' },
                  { key: 'spaceType', header: 'Mekan Türü', width: '120px', render: (row: any) => <StatusBadge label={row.spaceType} variant="default" /> },
                  { key: 'capacity', header: 'Kapasite', width: '80px', isNumeric: true, render: (row: any) => <span>{row.capacity} kişi</span> },
                  { key: 'area', header: 'Alan', width: '80px', isNumeric: true },
                  { key: 'assetCount', header: 'Demirbaş', width: '80px', isNumeric: true, render: (row: any) => <strong style={{ color: BILGEN_TOKENS.colors.accent }}>{row.assetCount} adet</strong> },
                  { key: 'status', header: 'Durum', width: '110px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'ACTIVE' ? 'success' : 'warning'} /> },
                ]}
              />
            </div>
          )}

          {activeTab === 'ASSETS' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Demirbaş & Fiziksel Varlık Yönetimi (Asset System of Record)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Varlık münferit takip edilen dayanıklı kalemdir (Asset ≠ Inventory). Satın alma bedeli muhasebe defter değeri değildir (PHY-010).
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <StatusBadge label="ASSET ≠ INVENTORY" variant="success" />
                  <StatusBadge label="WARRANTY TRACKING: ON" variant="default" />
                </div>
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={assets}
                columns={[
                  { key: 'assetNumber', header: 'Varlık No', width: '140px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.assetNumber}</strong> },
                  { key: 'name', header: 'Varlık Adı & Tanımı', width: '220px' },
                  { key: 'category', header: 'Kategori', width: '160px' },
                  { key: 'manufacturer', header: 'Marka / Model', width: '140px', render: (row: any) => <span>{row.manufacturer} {row.model}</span> },
                  { key: 'serialNumber', header: 'Seri Numarası', width: '120px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, fontSize: '11px' }}>{row.serialNumber}</span> },
                  { key: 'location', header: 'Bulunduğu Konum', width: '220px' },
                  { key: 'custodian', header: 'Sorumlu Personel', width: '180px' },
                  { key: 'condition', header: 'Kondisyon', width: '90px', render: (row: any) => <StatusBadge label={row.condition} variant={row.condition === 'NEW' || row.condition === 'GOOD' ? 'success' : 'default'} /> },
                  { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'AVAILABLE' ? 'success' : row.status === 'IN_USE' ? 'default' : 'warning'} /> },
                  { key: 'warrantyEndDate', header: 'Garanti Bitiş', width: '110px' },
                ]}
              />
            </div>
          )}

          {activeTab === 'ASSET_CUSTODY' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Zimmet & Kişisel Sorumluluk Yönetimi (Asset Custody Ledger)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Konum ile zimmet birbirinden bağımsızdır (PHY-008). Bir varlığın aynı anda en fazla bir aktif sorumlusu olabilir (PHY-016).
                  </p>
                </div>
                <StatusBadge label="ONE ACTIVE CUSTODIAN: ENFORCED" variant="success" />
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={assetCustodies}
                columns={[
                  { key: 'employeeName', header: 'Zimmetli Personel', width: '170px' },
                  { key: 'employeeNumber', header: 'Sicil No', width: '120px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.employeeNumber}</strong> },
                  { key: 'institution', header: 'Bağlı Olduğu Kurum', width: '180px' },
                  { key: 'assetNumber', header: 'Varlık No', width: '140px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.assetNumber}</span> },
                  { key: 'assetName', header: 'Varlık Tanımı', width: '220px' },
                  { key: 'assignedAt', header: 'Zimmet Tarihi', width: '130px' },
                  { key: 'status', header: 'Durum', width: '90px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'ACTIVE' ? 'success' : 'default'} /> },
                  { key: 'assignedBy', header: 'Tahsis Eden Yetkili', width: '180px' },
                  { key: 'notes', header: 'Tahsis Açıklaması' },
                ]}
              />
            </div>
          )}

          {activeTab === 'ASSET_TRANSFERS' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                    Kurumlar & Kampüsler Arası Varlık Transferleri (Asset Transfers)
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                    Transferler onay akışına (Maker-Checker) tabidir (PHY-018). Transfer tamamlandığında konum geçmişi ve güncel konum atomik olarak güncellenir.
                  </p>
                </div>
                <StatusBadge label="MAKER-CHECKER: ENFORCED" variant="success" />
              </div>

              <ExcelTable
                keyExtractor={(row: any) => row.id}
                data={assetTransfers}
                columns={[
                  { key: 'transferNumber', header: 'Transfer No', width: '130px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.transferNumber}</strong> },
                  { key: 'assetName', header: 'Transfer Edilen Varlık', width: '220px' },
                  { key: 'fromLocation', header: 'Çıkış Konumu', width: '220px' },
                  { key: 'toLocation', header: 'Hedef Konum', width: '220px' },
                  { key: 'requestedBy', header: 'Talep Eden', width: '170px' },
                  { key: 'approvedBy', header: 'Onaylayan', width: '170px' },
                  { key: 'status', header: 'Durum', width: '110px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'COMPLETED' ? 'success' : 'warning'} /> },
                  { key: 'requestedAt', header: 'Talep Tarihi', width: '130px' },
                  { key: 'reason', header: 'Transfer Gerekçesi' },
                ]}
              />
            </div>
          )}


          {activeTab === 'TRANSPORT_ROUTES' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Servis Güzergahları & Durak Konfigürasyonu (Transportation Routes & Stops)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                  Güzergah tekrar kullanılabilir plan şablonudur (Route ≠ Trip). En az 2 durak olmadan aktive edilemez (TRN-009, TRN-010).
                </p>
              </div>

              <ExcelTable<{ id: string; code: string; name: string; type: string; stopsCount: number; duration: string; distance: string; status: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'rt-1',
                    code: 'GZ-01-KADIKOY',
                    name: 'Kadıköy - Ataşehir - Kampüs Sabah Ringi',
                    type: 'MORNING_PICKUP',
                    stopsCount: 4,
                    duration: '45 dk',
                    distance: '18.4 km',
                    status: 'ACTIVE',
                  },
                  {
                    id: 'rt-2',
                    code: 'GZ-02-USKUDAR',
                    name: 'Üsküdar - Çamlıca - Kampüs Sabah Ringi',
                    type: 'MORNING_PICKUP',
                    stopsCount: 3,
                    duration: '35 dk',
                    distance: '14.2 km',
                    status: 'ACTIVE',
                  },
                  {
                    id: 'rt-3',
                    code: 'GZ-01-AKSAM',
                    name: 'Kampüs - Ataşehir - Kadıköy Akşam Dağıtım',
                    type: 'EVENING_DROPOFF',
                    stopsCount: 4,
                    duration: '50 dk',
                    distance: '19.1 km',
                    status: 'ACTIVE',
                  },
                ]}
                columns={[
                  { key: 'code', header: 'Güzergah Kodu', width: '150px', render: (row) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.code}</strong> },
                  { key: 'name', header: 'Güzergah Tanımı', width: '280px' },
                  { key: 'type', header: 'Servis Tipi', width: '160px', render: (row) => <StatusBadge label={row.type} variant="info" /> },
                  { key: 'stopsCount', header: 'Durak Sayısı', width: '110px', isNumeric: true },
                  { key: 'duration', header: 'Planlanan Süre', width: '120px', isNumeric: true },
                  { key: 'distance', header: 'Mesafe', width: '110px', isNumeric: true },
                  { key: 'status', header: 'Durum', width: '100px', render: (row) => <StatusBadge label={row.status} variant="success" /> },
                ]}
              />

              <div style={{ marginTop: '24px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  GZ-01-KADIKOY Güzergahı Durak Sıralaması (Planned Sequence)
                </h3>
              </div>
              <ExcelTable<{ id: string; seq: number; name: string; plannedTime: string; type: string; coords: string }>
                keyExtractor={(row) => row.id}
                data={[
                  { id: 'st-1', seq: 1, name: 'Kadıköy Rıhtım İskele Önü', plannedTime: '07:15', type: 'PICKUP', coords: '40.9904, 29.0254' },
                  { id: 'st-2', seq: 2, name: 'Ataşehir Doğu Kapısı Kavşağı', plannedTime: '07:30', type: 'PICKUP', coords: '40.9921, 29.1174' },
                  { id: 'st-3', seq: 3, name: 'Barbaros Mah. Halk Caddesi', plannedTime: '07:42', type: 'PICKUP', coords: '40.9950, 29.1020' },
                  { id: 'st-4', seq: 4, name: 'Bilgen Koleji Ana Kampüs Girişi', plannedTime: '08:00', type: 'CAMPUS_DESTINATION', coords: '41.0112, 29.1245' },
                ]}
                columns={[
                  { key: 'seq', header: 'Sıra', width: '70px', isNumeric: true },
                  { key: 'name', header: 'Durak Adı / Konum', width: '280px' },
                  { key: 'plannedTime', header: 'Hedef Saat', width: '110px', isNumeric: true },
                  { key: 'type', header: 'Durak Türü', width: '160px', render: (row) => <StatusBadge label={row.type} variant={row.type === 'CAMPUS_DESTINATION' ? 'success' : 'default'} /> },
                  { key: 'coords', header: 'Koordinat (WGS84)', width: '180px', isNumeric: true },
                ]}
              />
            </div>
          )}

          {activeTab === 'TRANSPORT_FLEET' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Araç Filosu, Operasyonel Kapasite & Sürücüler (Fleet & Crew)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                  Araç fiziki varlıkla (Asset) bağlanabilir veya taşeron taşıyıcıya ait olabilir (TRN-004, TRN-005). Kapasite aşımı kesinlikle engellenir (TRN-016).
                </p>
              </div>

              <ExcelTable<{ id: string; plate: string; type: string; capacity: number; effectiveCap: number; ownership: string; inspection: string; insurance: string; status: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'vh-1',
                    plate: '34 BLG 101',
                    type: 'MIDIBUS (27 Kişilik)',
                    capacity: 27,
                    effectiveCap: 26,
                    ownership: 'Özmal (Asset Ref: AST-VEH-001)',
                    inspection: '2027-04-15',
                    insurance: '2027-02-10',
                    status: 'ACTIVE',
                  },
                  {
                    id: 'vh-2',
                    plate: '34 TRN 882',
                    type: 'MINIBUS (16 Kişilik)',
                    capacity: 16,
                    effectiveCap: 15,
                    ownership: 'Özlem Taşımacılık A.Ş.',
                    inspection: '2026-11-20',
                    insurance: '2026-10-30',
                    status: 'ACTIVE',
                  },
                ]}
                columns={[
                  { key: 'plate', header: 'Plaka', width: '140px', render: (row) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.plate}</strong> },
                  { key: 'type', header: 'Araç Türü', width: '180px' },
                  { key: 'capacity', header: 'Koltuk', width: '90px', isNumeric: true },
                  { key: 'effectiveCap', header: 'Efektif Kapasite', width: '130px', isNumeric: true },
                  { key: 'ownership', header: 'Mülkiyet / Sağlayıcı', width: '240px' },
                  { key: 'inspection', header: 'Muayene Geçerlilik', width: '140px', isNumeric: true },
                  { key: 'insurance', header: 'Sigorta Geçerlilik', width: '140px', isNumeric: true },
                  { key: 'status', header: 'Durum', width: '100px', render: (row) => <StatusBadge label={row.status} variant="success" /> },
                ]}
              />

              <div style={{ marginTop: '24px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Yetkili Sürücü & Rehber Personel Sicilleri (Driver & Attendant Profiles)
                </h3>
              </div>
              <ExcelTable<{ id: string; name: string; role: string; type: string; license: string; psychotechnical: string; criminalChecked: string; status: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'dr-1',
                    name: 'Ahmet Yılmaz',
                    role: 'Sürücü',
                    type: 'INTERNAL (Kurum Personeli)',
                    license: 'D Sınıfı (34-99812)',
                    psychotechnical: '2027-08-01',
                    criminalChecked: 'Adli Sicil Temiz (2026-09-01)',
                    status: 'ACTIVE',
                  },
                  {
                    id: 'dr-2',
                    name: 'Mehmet Demir',
                    role: 'Sürücü',
                    type: 'CONTRACTED (Özlem Taşımacılık)',
                    license: 'D Sınıfı (34-11204)',
                    psychotechnical: '2027-01-15',
                    criminalChecked: 'Adli Sicil Temiz (2026-08-20)',
                    status: 'ACTIVE',
                  },
                  {
                    id: 'at-1',
                    name: 'Ayşe Kaya',
                    role: 'Rehber Personel',
                    type: 'INTERNAL (Kurum Personeli)',
                    license: 'İlk Yardım Sertifikalı',
                    psychotechnical: 'Muaf',
                    criminalChecked: 'Adli Sicil Temiz (2026-09-01)',
                    status: 'ACTIVE',
                  },
                ]}
                columns={[
                  { key: 'name', header: 'Ad Soyad', width: '180px' },
                  { key: 'role', header: 'Görev', width: '130px', render: (row) => <StatusBadge label={row.role} variant={row.role === 'Sürücü' ? 'info' : 'default'} /> },
                  { key: 'type', header: 'İstihdam Türü', width: '220px' },
                  { key: 'license', header: 'Ehliyet / Sertifika', width: '180px' },
                  { key: 'psychotechnical', header: 'Psikoteknik', width: '120px', isNumeric: true },
                  { key: 'criminalChecked', header: 'Güvenlik Taraması', width: '210px' },
                  { key: 'status', header: 'Durum', width: '100px', render: (row) => <StatusBadge label={row.status} variant="success" /> },
                ]}
              />
            </div>
          )}

          {activeTab === 'TRANSPORT_PASSENGERS' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Servis Yolcu Listesi & Güvenli Teslimat Yetkilileri (Passenger Manifest & Handover)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                  Yolcu kaydı BilgenOkul akademik masterını kopyalamaz (TRN-002, TRN-003). Veli teslim şartı olan öğrenciler yetkili kişi olmadan teslim edilemez (TRN-024).
                </p>
              </div>

              <ExcelTable<{ id: string; studentNo: string; name: string; route: string; stop: string; direction: string; requiresHandover: string; emergencyContact: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'pass-1',
                    studentNo: 'STU-2026-0042',
                    name: 'Kerem Bilgen',
                    route: 'GZ-01-KADIKOY',
                    stop: 'Ataşehir Doğu Kapısı',
                    direction: 'SABAH & AKSAM',
                    requiresHandover: 'ZORUNLU (1. Kademe)',
                    emergencyContact: 'Fatma Bilgen (+90 555 222 3344)',
                  },
                  {
                    id: 'pass-2',
                    studentNo: 'STU-2026-0089',
                    name: 'Zeynep Kaya',
                    route: 'GZ-01-KADIKOY',
                    stop: 'Kadıköy Rıhtım İskele',
                    direction: 'SABAH & AKSAM',
                    requiresHandover: 'ZORUNLU (1. Kademe)',
                    emergencyContact: 'Murat Kaya (+90 555 444 5566)',
                  },
                ]}
                columns={[
                  { key: 'studentNo', header: 'Öğrenci No', width: '140px', render: (row) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.studentNo}</strong> },
                  { key: 'name', header: 'Öğrenci Adı Soyadı', width: '180px' },
                  { key: 'route', header: 'Atanan Güzergah', width: '160px' },
                  { key: 'stop', header: 'Biniş / İniş Durağı', width: '200px' },
                  { key: 'direction', header: 'Yön', width: '140px' },
                  { key: 'requiresHandover', header: 'Veli Teslim Şartı', width: '170px', render: (row) => <StatusBadge label={row.requiresHandover} variant="warning" /> },
                  { key: 'emergencyContact', header: 'Acil Durum İletişim', width: '240px' },
                ]}
              />

              <div style={{ marginTop: '24px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Kerem Bilgen — Yetkili Teslim Alma İzinleri (Handover Authorizations)
                </h3>
              </div>
              <ExcelTable<{ id: string; person: string; rel: string; scope: string; validDates: string; status: string }>
                keyExtractor={(row) => row.id}
                data={[
                  { id: 'ha-1', person: 'Fatma Bilgen', rel: 'ANNE (Yasal Veli)', scope: 'REGULAR', validDates: '2026-09-01 — 2027-06-30', status: 'ACTIVE' },
                  { id: 'ha-2', person: 'Ali Bilgen', rel: 'BABA (Yasal Veli)', scope: 'REGULAR', validDates: '2026-09-01 — 2027-06-30', status: 'ACTIVE' },
                  { id: 'ha-3', person: 'Mehmet Özkan', rel: 'DAYI (Geçici Yetkili)', scope: 'TEMPORARY_DELEGATE', validDates: '2026-09-25 — 2026-09-26', status: 'ACTIVE' },
                ]}
                columns={[
                  { key: 'person', header: 'Teslim Almaya Yetkili Kişi', width: '220px' },
                  { key: 'rel', header: 'Yakınlık / Yetki Kapsamı', width: '200px' },
                  { key: 'scope', header: 'Kapsam Türü', width: '150px' },
                  { key: 'validDates', header: 'Geçerlilik Tarihleri', width: '210px', isNumeric: true },
                  { key: 'status', header: 'Yetki Durumu', width: '120px', render: (row) => <StatusBadge label={row.status} variant="success" /> },
                ]}
              />
            </div>
          )}

          {activeTab === 'TRANSPORT_TRIPS' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Günlük Canlı Sefer Takibi, Biniş/İniş & Güvenli Teslimat (Daily Trips & Live Safe Handover)
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                  Sefer başlatıldığında yolcu ve durak listesi dondurulur (TRN-019). Araçta yolcu varken sefer tamamlanamaz (TRN-033).
                </p>
              </div>

              <ExcelTable<{ id: string; tripCode: string; date: string; shift: string; vehicle: string; driver: string; expected: number; boarded: number; dropped: number; status: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'tr-1',
                    tripCode: 'TRIP-20260925-GZ01-M',
                    date: '2026-09-25',
                    shift: 'MORNING_PICKUP',
                    vehicle: '34 BLG 101',
                    driver: 'Ahmet Yılmaz',
                    expected: 2,
                    boarded: 2,
                    dropped: 2,
                    status: 'COMPLETED',
                  },
                ]}
                columns={[
                  { key: 'tripCode', header: 'Sefer Kodu', width: '200px', render: (row) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.tripCode}</strong> },
                  { key: 'date', header: 'Tarih', width: '110px', isNumeric: true },
                  { key: 'shift', header: 'Vardiya', width: '150px' },
                  { key: 'vehicle', header: 'Araç', width: '130px' },
                  { key: 'driver', header: 'Sürücü', width: '160px' },
                  { key: 'expected', header: 'Beklenen', width: '90px', isNumeric: true },
                  { key: 'boarded', header: 'Binen', width: '90px', isNumeric: true },
                  { key: 'dropped', header: 'İnen', width: '90px', isNumeric: true },
                  { key: 'status', header: 'Sefer Durumu', width: '120px', render: (row) => <StatusBadge label={row.status} variant="success" /> },
                ]}
              />

              <div style={{ marginTop: '24px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Yolcu Biniş, İniş & Güvenli Teslimat Denetim Günlüğü (Safe Handover Audit)
                </h3>
              </div>
              <ExcelTable<{ id: string; student: string; boardedAt: string; droppedAt: string; handoverTo: string; method: string; status: string }>
                keyExtractor={(row) => row.id}
                data={[
                  {
                    id: 'ev-1',
                    student: 'Kerem Bilgen (STU-2026-0042)',
                    boardedAt: '07:31:05 (Ataşehir)',
                    droppedAt: '08:02:14 (Kampüs Giriş)',
                    handoverTo: 'Nöbetçi Öğretmen / Fatma Bilgen',
                    method: 'VERIFICATION_PIN (Doğrulandı)',
                    status: 'DELIVERED_SAFE',
                  },
                  {
                    id: 'ev-2',
                    student: 'Zeynep Kaya (STU-2026-0089)',
                    boardedAt: '07:16:22 (Kadıköy)',
                    droppedAt: '08:02:18 (Kampüs Giriş)',
                    handoverTo: 'Nöbetçi Öğretmen / Murat Kaya',
                    method: 'PHYSICAL_SIGNATURE (Doğrulandı)',
                    status: 'DELIVERED_SAFE',
                  },
                ]}
                columns={[
                  { key: 'student', header: 'Öğrenci', width: '220px' },
                  { key: 'boardedAt', header: 'Biniş Zamanı & Durak', width: '180px', isNumeric: true },
                  { key: 'droppedAt', header: 'İniş Zamanı & Durak', width: '180px', isNumeric: true },
                  { key: 'handoverTo', header: 'Teslim Edilen Yetkili', width: '220px' },
                  { key: 'method', header: 'Doğrulama Metodu', width: '220px' },
                  { key: 'status', header: 'Teslimat Güvenliği', width: '140px', render: (row) => <StatusBadge label={row.status} variant="success" /> },
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
