'use client';

import React, { useState } from 'react';
import {
  ExcelTable,
  StatusBadge,
  KpiCard,
  FilterToolbar,
  SlideOverDrawer,
  ModalDialog,
  BILGEN_TOKENS,
} from '@bilgenos/ui';

export function TransportationModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChip, setFilterChip] = useState('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Modals state
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [newTripForm, setNewTripForm] = useState({
    routeCode: 'GZ-03-MALTEPE',
    vehicle: '34 BLG 205 (Otobüs)',
    driver: 'Murat Arslan',
    attendant: 'Selin Şen (Rehber)',
    shift: 'MORNING_PICKUP',
  });

  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverPassenger, setHandoverPassenger] = useState<any>(null);
  const [pinInput, setPinInput] = useState('');

  const [isNewRouteModalOpen, setIsNewRouteModalOpen] = useState(false);
  const [newRouteForm, setNewRouteForm] = useState({ code: 'GZ-04-BEYKOZ', name: 'Beykoz - Kavacık - Kampüs Ringi', stops: 4, duration: '40 dk', distance: '16.5 km' });

  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);
  const [newVehicleForm, setNewVehicleForm] = useState({ plate: '34 BLG 301', type: 'MIDIBUS (29 Kişilik)', seatCap: 29, effCap: 28, owner: 'Özmal (Asset Ref: AST-VEH-003)', insp: '2027-08-20' });

  const [isAssignPassengerModalOpen, setIsAssignPassengerModalOpen] = useState(false);
  const [newAssignForm, setNewAssignForm] = useState({ studentNo: 'STU-2026-0150', name: 'Alp Erdem', route: 'GZ-01-KADIKOY', stop: 'Kozyatağı Metro', guardianName: 'Banu Erdem (Anne)', guardianPhone: '0532 999 11 22' });

  // Drawers state
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<any>(null);

  // Trips data
  const [trips, setTrips] = useState([
    {
      id: 'tr-1',
      tripCode: 'TRIP-20260925-GZ01-M',
      routeCode: 'GZ-01-KADIKOY',
      routeName: 'Kadıköy - Ataşehir - Kampüs Sabah Ringi',
      date: '2026-09-25',
      shift: 'MORNING_PICKUP',
      vehicle: '34 BLG 101 (Midibüs)',
      driver: 'Ahmet Yılmaz',
      attendant: 'Ayşe Kaya (Rehber)',
      expected: 3,
      boarded: 2,
      dropped: 1,
      status: 'IN_PROGRESS',
    },
    {
      id: 'tr-2',
      tripCode: 'TRIP-20260925-GZ02-M',
      routeCode: 'GZ-02-USKUDAR',
      routeName: 'Üsküdar - Çamlıca - Kampüs Sabah Ringi',
      date: '2026-09-25',
      shift: 'MORNING_PICKUP',
      vehicle: '34 TRN 882 (Minibüs)',
      driver: 'Mehmet Demir',
      attendant: 'Fatma Ak (Rehber)',
      expected: 2,
      boarded: 2,
      dropped: 2,
      status: 'COMPLETED',
    },
  ]);

  // Passengers manifest data
  const [passengers, setPassengers] = useState([
    {
      id: 'pass-1',
      studentNo: 'STU-2026-0042',
      name: 'Kerem Bilgen',
      route: 'GZ-01-KADIKOY',
      stop: 'Ataşehir Doğu Kapısı',
      boardingStatus: 'BOARDED',
      boardedAt: '07:31:05',
      droppedOffAt: null as string | null,
      requiresHandover: true,
      handoverVerified: false,
      guardianName: 'Fatma Bilgen (Anne)',
      guardianPhone: '0532 111 22 33',
    },
    {
      id: 'pass-2',
      studentNo: 'STU-2026-0089',
      name: 'Zeynep Kaya',
      route: 'GZ-01-KADIKOY',
      stop: 'Kadıköy Rıhtım İskele',
      boardingStatus: 'DROPPED_OFF',
      boardedAt: '07:15:20',
      droppedOffAt: '08:02:10',
      requiresHandover: true,
      handoverVerified: true,
      guardianName: 'Murat Kaya (Baba)',
      guardianPhone: '0533 444 55 66',
    },
    {
      id: 'pass-3',
      studentNo: 'STU-2026-0104',
      name: 'Caner Özdemir',
      route: 'GZ-01-KADIKOY',
      stop: 'Barbaros Mah. Halk Cad.',
      boardingStatus: 'PENDING',
      boardedAt: null as string | null,
      droppedOffAt: null as string | null,
      requiresHandover: false,
      handoverVerified: false,
      guardianName: 'Selin Özdemir (Veli)',
      guardianPhone: '0535 777 88 99',
    },
  ]);

  // Routes data
  const [routes, setRoutes] = useState([
    { code: 'GZ-01-KADIKOY', name: 'Kadıköy - Ataşehir - Kampüs Sabah', stops: 4, duration: '45 dk', distance: '18.4 km', status: 'ACTIVE' },
    { code: 'GZ-02-USKUDAR', name: 'Üsküdar - Çamlıca - Kampüs Sabah', stops: 3, duration: '35 dk', distance: '14.2 km', status: 'ACTIVE' },
    { code: 'GZ-03-MALTEPE', name: 'Maltepe - Bostancı - Kampüs Sabah', stops: 5, duration: '50 dk', distance: '21.0 km', status: 'ACTIVE' },
    { code: 'GZ-01-AKSAM', name: 'Kampüs - Ataşehir - Kadıköy Akşam', stops: 4, duration: '50 dk', distance: '19.1 km', status: 'ACTIVE' },
  ]);

  // Fleet data
  const [vehicles, setVehicles] = useState([
    { plate: '34 BLG 101', type: 'MIDIBUS (27 Kişilik)', seatCap: 27, effCap: 26, owner: 'Özmal (Asset Ref: AST-VEH-001)', insp: '2027-04-15', status: 'ACTIVE' },
    { plate: '34 TRN 882', type: 'MINIBUS (16 Kişilik)', seatCap: 16, effCap: 15, owner: 'Özlem Taşımacılık A.Ş. (Taşeron)', insp: '2026-11-20', status: 'ACTIVE' },
    { plate: '34 BLG 205', type: 'BUS (45 Kişilik)', seatCap: 45, effCap: 43, owner: 'Özmal (Asset Ref: AST-VEH-002)', insp: '2027-01-10', status: 'ACTIVE' },
  ]);

  // Handlers for Live Manifest actions
  const handleBoardPassenger = (id: string) => {
    const time = new Date().toLocaleTimeString('tr-TR');
    setPassengers(prev => prev.map(p => p.id === id ? { ...p, boardingStatus: 'BOARDED', boardedAt: time } : p));
    showNotice('Öğrenci araca bindi olarak kaydedildi.');
  };

  const handleDropoffPassenger = (id: string) => {
    const time = new Date().toLocaleTimeString('tr-TR');
    setPassengers(prev => prev.map(p => p.id === id ? { ...p, boardingStatus: 'DROPPED_OFF', droppedOffAt: time } : p));
    showNotice('Öğrenci durakta indi olarak kaydedildi.');
  };

  const handleOpenHandoverModal = (p: any) => {
    setHandoverPassenger(p);
    setPinInput('');
    setIsHandoverModalOpen(true);
  };

  const handleVerifyHandover = () => {
    if (!handoverPassenger) return;
    if (pinInput.trim() !== '1234' && pinInput.trim() !== '9876') {
      alert('Hatalı Veli PIN Kodu! Lütfen velinin SMS ile aldığı 4 haneli kodu giriniz (Demo Kodu: 1234)');
      return;
    }
    setPassengers(prev => prev.map(p => p.id === handoverPassenger.id ? { ...p, handoverVerified: true } : p));
    setIsHandoverModalOpen(false);
    showNotice(`${handoverPassenger.name} velisine güvenle teslim edildi. Denetim kaydı oluşturuldu.`);
  };

  const handleCreateTrip = () => {
    const newTrip = {
      id: `tr-${Date.now()}`,
      tripCode: `TRIP-20260925-${newTripForm.routeCode.split('-')[1]}-${Date.now().toString().slice(-3)}`,
      routeCode: newTripForm.routeCode,
      routeName: routes.find(r => r.code === newTripForm.routeCode)?.name || newTripForm.routeCode,
      date: '2026-09-25',
      shift: newTripForm.shift,
      vehicle: newTripForm.vehicle,
      driver: newTripForm.driver,
      attendant: newTripForm.attendant,
      expected: 3,
      boarded: 0,
      dropped: 0,
      status: 'IN_PROGRESS',
    };
    setTrips(prev => [newTrip, ...prev]);
    setIsNewTripModalOpen(false);
    showNotice(`Yeni sefer (${newTrip.tripCode}) başarıyla başlatıldı ve manifesto kilitlendi.`);
  };

  const handleCreateRoute = () => {
    setRoutes(prev => [...prev, { ...newRouteForm, status: 'ACTIVE' }]);
    setIsNewRouteModalOpen(false);
    showNotice(`Yeni güzergah (${newRouteForm.code}) başarıyla sisteme eklendi.`);
  };

  const handleCreateVehicle = () => {
    setVehicles(prev => [...prev, { ...newVehicleForm, status: 'ACTIVE' }]);
    setIsNewVehicleModalOpen(false);
    showNotice(`Yeni araç (${newVehicleForm.plate}) filoya eklendi.`);
  };

  const handleAssignPassenger = () => {
    const newPass = {
      id: `pass-${Date.now()}`,
      studentNo: newAssignForm.studentNo,
      name: newAssignForm.name,
      route: newAssignForm.route,
      stop: newAssignForm.stop,
      boardingStatus: 'PENDING',
      boardedAt: null,
      droppedOffAt: null,
      requiresHandover: true,
      handoverVerified: false,
      guardianName: newAssignForm.guardianName,
      guardianPhone: newAssignForm.guardianPhone,
    };
    setPassengers(prev => [newPass, ...prev]);
    setIsAssignPassengerModalOpen(false);
    showNotice(`${newPass.name} servise atandı.`);
  };

  return (
    <div>
      {/* Toast Notification */}
      {actionNotice && (
        <div
          style={{
            position: 'fixed',
            top: '56px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: BILGEN_TOKENS.shadows.lg,
            borderLeft: `4px solid ${BILGEN_TOKENS.colors.success}`,
          }}
        >
          ✓ {actionNotice}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <KpiCard
          title="Toplam Servis Filosu"
          value={`${vehicles.length + 11} Araç`}
          subtitle="12 Özmal, 2 Taşeron"
          badge={{ text: 'Kapasite: 284 Koltuk', variant: 'info' }}
          icon="🚐"
        />
        <KpiCard
          title="Canlı Aktif Seferler"
          value={`${trips.filter(t => t.status === 'IN_PROGRESS').length} Sefer`}
          subtitle={`${trips.filter(t => t.status === 'COMPLETED').length} Sefer Tamamlandı`}
          badge={{ text: 'Sabah Vardiyası', variant: 'success' }}
          icon="📍"
        />
        <KpiCard
          title="Servisteki Yolcu"
          value={`${passengers.filter(p => p.boardingStatus === 'BOARDED').length} Öğrenci`}
          subtitle={`${passengers.filter(p => p.boardingStatus === 'DROPPED_OFF').length} İndi / Teslim Edildi`}
          badge={{ text: `Toplam ${passengers.length} Kayıtlı`, variant: 'info' }}
          icon="🎒"
        />
        <KpiCard
          title="Güvenli Veli Teslimatı"
          value={`${passengers.filter(p => p.requiresHandover && !p.handoverVerified).length} Bekleyen`}
          subtitle={`${passengers.filter(p => p.handoverVerified).length} Güvenle Teslim Edildi`}
          badge={{ text: 'PIN Doğrulamalı', variant: 'warning' }}
          icon="🛡️"
        />
      </div>

      {/* TAB 1: Canlı Sefer & Teslimat */}
      {(activeSubTab === 'TRN_TRIPS' || !activeSubTab) && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Sefer kodu, güzergah veya plaka ara..."
            filterOptions={[
              { label: 'Tümü', value: 'ALL' },
              { label: 'Devam Edenler', value: 'IN_PROGRESS' },
              { label: 'Tamamlananlar', value: 'COMPLETED' },
            ]}
            activeFilter={filterChip}
            onFilterChange={setFilterChip}
            primaryAction={{
              label: '+ Yeni Sefer Başlat',
              onClick: () => setIsNewTripModalOpen(true),
              icon: '▶',
            }}
          />

          <ExcelTable
            keyExtractor={(row) => row.id}
            data={trips.filter(t => {
              if (filterChip !== 'ALL' && t.status !== filterChip) return false;
              if (searchQuery && !t.tripCode.toLowerCase().includes(searchQuery.toLowerCase()) && !t.routeName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
              return true;
            })}
            columns={[
              {
                key: 'tripCode',
                header: 'Sefer Kodu',
                width: '210px',
                render: (row) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.tripCode}</strong>,
              },
              { key: 'routeName', header: 'Güzergah Tanımı', width: '280px' },
              { key: 'vehicle', header: 'Atanan Araç', width: '180px' },
              { key: 'driver', header: 'Sürücü / Rehber', width: '200px', render: (row) => <span>{row.driver} / {row.attendant}</span> },
              { key: 'expected', header: 'Beklenen', width: '90px', isNumeric: true },
              { key: 'boarded', header: 'Binen', width: '80px', isNumeric: true },
              { key: 'dropped', header: 'İnen', width: '80px', isNumeric: true },
              {
                key: 'status',
                header: 'Durum',
                width: '120px',
                render: (row) => <StatusBadge label={row.status} variant={row.status === 'IN_PROGRESS' ? 'info' : 'success'} />,
              },
              {
                key: 'actions',
                header: 'Operasyon',
                width: '120px',
                align: 'center',
                render: (row) => (
                  <button
                    onClick={() => setSelectedTrip(row)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: `1px solid ${BILGEN_TOKENS.colors.accentBorder}`,
                      backgroundColor: BILGEN_TOKENS.colors.accentLight,
                      color: BILGEN_TOKENS.colors.accent,
                      cursor: 'pointer',
                    }}
                  >
                    🔍 360° İncele
                  </button>
                ),
              },
            ]}
          />

          <div style={{ marginTop: '28px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', margin: '0 0 4px 0', fontWeight: 700, color: BILGEN_TOKENS.colors.textPrimary }}>
              Anlık Yolcu Manifestosu & Veli Güvenlik Durumu (Live Manifest & Safe Handover)
            </h3>
            <p style={{ margin: 0, fontSize: '11.5px', color: BILGEN_TOKENS.colors.textSecondary }}>
              Aşağıdaki butonlarla anlık biniş, iniş ve PIN kodlu veli teslim işlemlerini canlı olarak yürütebilirsiniz.
            </p>
          </div>

          <ExcelTable
            keyExtractor={(row) => row.id}
            data={passengers}
            columns={[
              {
                key: 'studentNo',
                header: 'Öğrenci No',
                width: '140px',
                render: (row) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.studentNo}</strong>,
              },
              {
                key: 'name',
                header: 'Öğrenci Adı',
                width: '170px',
                render: (row) => (
                  <span
                    onClick={() => setSelectedPassenger(row)}
                    style={{ fontWeight: 600, color: BILGEN_TOKENS.colors.accent, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {row.name}
                  </span>
                ),
              },
              { key: 'stop', header: 'Durak', width: '200px' },
              {
                key: 'boardingStatus',
                header: 'Servis Durumu',
                width: '130px',
                render: (row) => (
                  <StatusBadge
                    label={row.boardingStatus}
                    variant={row.boardingStatus === 'BOARDED' ? 'warning' : row.boardingStatus === 'DROPPED_OFF' ? 'success' : 'default'}
                  />
                ),
              },
              {
                key: 'handover',
                header: 'Veli Teslim Şartı',
                width: '170px',
                render: (row) => (
                  <StatusBadge
                    label={row.handoverVerified ? '✓ TESLİM EDİLDİ' : (row.requiresHandover ? 'ZORUNLU (Bekliyor)' : 'Muaf')}
                    variant={row.handoverVerified ? 'success' : (row.requiresHandover ? 'danger' : 'default')}
                  />
                ),
              },
              { key: 'guardianName', header: 'Yetkili Veli', width: '180px' },
              {
                key: 'quickAction',
                header: 'Hızlı Eylem',
                width: '170px',
                align: 'center',
                render: (row) => {
                  if (row.boardingStatus === 'PENDING') {
                    return (
                      <button
                        onClick={() => handleBoardPassenger(row.id)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        🚌 Biniş Al
                      </button>
                    );
                  }
                  if (row.boardingStatus === 'BOARDED') {
                    return (
                      <button
                        onClick={() => handleDropoffPassenger(row.id)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#F59E0B',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        📍 İndir
                      </button>
                    );
                  }
                  if (row.boardingStatus === 'DROPPED_OFF' && row.requiresHandover && !row.handoverVerified) {
                    return (
                      <button
                        onClick={() => handleOpenHandoverModal(row)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        🔑 Teslim Et (PIN)
                      </button>
                    );
                  }
                  return (
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>
                      ✓ Tamamlandı
                    </span>
                  );
                },
              },
            ]}
          />
        </div>
      )}

      {/* TAB 2: Güzergahlar & Duraklar */}
      {activeSubTab === 'TRN_ROUTES' && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Güzergah kodu veya durak ara..."
            primaryAction={{
              label: '+ Yeni Güzergah Tanımla',
              onClick: () => setIsNewRouteModalOpen(true),
              icon: '+',
            }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.code}
            data={routes.filter(r => !searchQuery || r.code.toLowerCase().includes(searchQuery.toLowerCase()) || r.name.toLowerCase().includes(searchQuery.toLowerCase()))}
            columns={[
              { key: 'code', header: 'Güzergah Kodu', width: '160px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.code}</strong> },
              { key: 'name', header: 'Güzergah Adı', width: '280px' },
              { key: 'stops', header: 'Durak Sayısı', width: '110px', isNumeric: true },
              { key: 'duration', header: 'Planlanan Süre', width: '120px', isNumeric: true },
              { key: 'distance', header: 'Mesafe', width: '100px', isNumeric: true },
              { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
            ]}
          />
        </div>
      )}

      {/* TAB 3: Araç Filosu & Sürücüler */}
      {activeSubTab === 'TRN_FLEET' && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Plaka veya araç tipi ara..."
            primaryAction={{
              label: '+ Yeni Araç Ekle',
              onClick: () => setIsNewVehicleModalOpen(true),
              icon: '+',
            }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.plate}
            data={vehicles.filter(v => !searchQuery || v.plate.toLowerCase().includes(searchQuery.toLowerCase()) || v.type.toLowerCase().includes(searchQuery.toLowerCase()))}
            columns={[
              { key: 'plate', header: 'Plaka No', width: '140px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.plate}</strong> },
              { key: 'type', header: 'Araç Türü', width: '180px' },
              { key: 'seatCap', header: 'Koltuk', width: '90px', isNumeric: true },
              { key: 'effCap', header: 'Efektif Kapasite', width: '130px', isNumeric: true },
              { key: 'owner', header: 'Mülkiyet / Sağlayıcı', width: '260px' },
              { key: 'insp', header: 'Muayene Tarihi', width: '140px', isNumeric: true },
              { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
            ]}
          />
        </div>
      )}

      {/* TAB 4: Yolcu Listesi & Zimmet */}
      {activeSubTab === 'TRN_PASSENGERS' && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Öğrenci no, ad veya durak ara..."
            primaryAction={{
              label: '+ Öğrenciye Servis Ata',
              onClick: () => setIsAssignPassengerModalOpen(true),
              icon: '+',
            }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={passengers.filter(p => !searchQuery || p.studentNo.toLowerCase().includes(searchQuery.toLowerCase()) || p.name.toLowerCase().includes(searchQuery.toLowerCase()))}
            columns={[
              { key: 'studentNo', header: 'Öğrenci No', width: '140px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.studentNo}</strong> },
              { key: 'name', header: 'Öğrenci Adı', width: '180px' },
              { key: 'route', header: 'Atanan Güzergah', width: '160px' },
              { key: 'stop', header: 'Biniş Durağı', width: '200px' },
              { key: 'requiresHandover', header: 'Veli Teslim Şartı', width: '170px', render: (row: any) => <StatusBadge label={row.requiresHandover ? 'ZORUNLU' : 'Muaf'} variant={row.requiresHandover ? 'warning' : 'default'} /> },
              { key: 'guardianName', header: 'Yetkili Veli', width: '200px' },
              { key: 'guardianPhone', header: 'İletişim', width: '160px', isNumeric: true },
            ]}
          />
        </div>
      )}

      {/* MODAL 1: Yeni Sefer Başlat */}
      <ModalDialog
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        title="Yeni Canlı Sefer Başlat"
        subtitle="Güzergah, araç ve görevli personeli seçerek seferi canlıya alınız."
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsNewTripModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', fontSize: '12px' }}>
              Vazgeç
            </button>
            <button onClick={handleCreateTrip} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>
              Seferi Başlat ve Listeyi Kilitle
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Güzergah Seçimi</label>
            <select
              value={newTripForm.routeCode}
              onChange={(e) => setNewTripForm({ ...newTripForm, routeCode: e.target.value })}
              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
            >
              {routes.map(r => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Atanan Araç</label>
            <select
              value={newTripForm.vehicle}
              onChange={(e) => setNewTripForm({ ...newTripForm, vehicle: e.target.value })}
              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
            >
              {vehicles.map(v => <option key={v.plate} value={`${v.plate} (${v.type.split(' ')[0]})`}>{v.plate} ({v.type})</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Sürücü</label>
              <input
                type="text"
                value={newTripForm.driver}
                onChange={(e) => setNewTripForm({ ...newTripForm, driver: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Rehber / Hostes</label>
              <input
                type="text"
                value={newTripForm.attendant}
                onChange={(e) => setNewTripForm({ ...newTripForm, attendant: e.target.value })}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>
      </ModalDialog>

      {/* MODAL 2: Veli PIN Doğrulama ile Güvenli Teslimat */}
      <ModalDialog
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        title="Güvenli Veli Teslimatı Doğrulama"
        subtitle={handoverPassenger ? `${handoverPassenger.name} (${handoverPassenger.studentNo}) için veli el sıkışma işlemi.` : undefined}
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsHandoverModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', fontSize: '12px' }}>
              İptal
            </button>
            <button onClick={handleVerifyHandover} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>
              ✓ PIN Doğrula ve Teslim Et
            </button>
          </div>
        }
      >
        {handoverPassenger && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>YETKİLİ VELİ BİLGİSİ</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{handoverPassenger.guardianName}</div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>İletişim: {handoverPassenger.guardianPhone}</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                4 Haneli Veli Teslimat PIN Kodu
              </label>
              <input
                type="text"
                placeholder="Örn: 1234"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #2563EB',
                  fontSize: '18px',
                  fontFamily: BILGEN_TOKENS.typography.fontFamilyMono,
                  letterSpacing: '6px',
                  textAlign: 'center',
                }}
              />
              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                * Demo Doğrulama Kodu: <strong>1234</strong> veya <strong>9876</strong>
              </span>
            </div>
          </div>
        )}
      </ModalDialog>

      {/* MODAL 3: Yeni Güzergah */}
      <ModalDialog
        isOpen={isNewRouteModalOpen}
        onClose={() => setIsNewRouteModalOpen(false)}
        title="Yeni Servis Güzergahı Ekle"
        subtitle="Normatif hat kodu ve durak sayısını tanımlayınız."
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsNewRouteModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', fontSize: '12px' }}>İptal</button>
            <button onClick={handleCreateRoute} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Kaydet</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Güzergah Kodu</label>
            <input type="text" value={newRouteForm.code} onChange={e => setNewRouteForm({ ...newRouteForm, code: e.target.value })} style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Güzergah Adı</label>
            <input type="text" value={newRouteForm.name} onChange={e => setNewRouteForm({ ...newRouteForm, name: e.target.value })} style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }} />
          </div>
        </div>
      </ModalDialog>

      {/* MODAL 4: Yeni Araç */}
      <ModalDialog
        isOpen={isNewVehicleModalOpen}
        onClose={() => setIsNewVehicleModalOpen(false)}
        title="Yeni Servis Aracı Kaydet"
        subtitle="Plaka ve koltuk kapasitesini giriniz."
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsNewVehicleModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', fontSize: '12px' }}>İptal</button>
            <button onClick={handleCreateVehicle} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Filoya Ekle</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Plaka No</label>
            <input type="text" value={newVehicleForm.plate} onChange={e => setNewVehicleForm({ ...newVehicleForm, plate: e.target.value })} style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Araç Tipi</label>
            <input type="text" value={newVehicleForm.type} onChange={e => setNewVehicleForm({ ...newVehicleForm, type: e.target.value })} style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }} />
          </div>
        </div>
      </ModalDialog>

      {/* MODAL 5: Öğrenciye Servis Ata */}
      <ModalDialog
        isOpen={isAssignPassengerModalOpen}
        onClose={() => setIsAssignPassengerModalOpen(false)}
        title="Öğrenciye Servis Atama"
        subtitle="Öğrenciyi bir güzergah ve biniş durağı ile eşleyiniz."
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsAssignPassengerModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', fontSize: '12px' }}>İptal</button>
            <button onClick={handleAssignPassenger} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Atamayı Tamamla</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Öğrenci Adı Soyadı</label>
            <input type="text" value={newAssignForm.name} onChange={e => setNewAssignForm({ ...newAssignForm, name: e.target.value })} style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Güzergah</label>
            <select value={newAssignForm.route} onChange={e => setNewAssignForm({ ...newAssignForm, route: e.target.value })} style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }}>
              {routes.map(r => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>Biniş Durağı</label>
            <input type="text" value={newAssignForm.stop} onChange={e => setNewAssignForm({ ...newAssignForm, stop: e.target.value })} style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px' }} />
          </div>
        </div>
      </ModalDialog>

      {/* DRAWER 1: Trip 360 */}
      <SlideOverDrawer
        isOpen={Boolean(selectedTrip)}
        onClose={() => setSelectedTrip(null)}
        title={selectedTrip?.tripCode || 'Sefer 360° İnceleme'}
        subtitle={selectedTrip ? `Güzergah: ${selectedTrip.routeName}` : undefined}
        badge={selectedTrip ? <StatusBadge label={selectedTrip.status} variant={selectedTrip.status === 'IN_PROGRESS' ? 'info' : 'success'} /> : undefined}
      >
        {selectedTrip && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>SEFER DETAYLARI</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>
                <p><strong>Araç:</strong> {selectedTrip.vehicle}</p>
                <p><strong>Sürücü:</strong> {selectedTrip.driver}</p>
                <p><strong>Rehber:</strong> {selectedTrip.attendant}</p>
                <p><strong>Tarih:</strong> {selectedTrip.date}</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 700 }}>DOLULUK DURUMU</div>
              <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '4px' }}>
                Beklenen: {selectedTrip.expected} | Binen: {selectedTrip.boarded} | İnen: {selectedTrip.dropped}
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* DRAWER 2: Passenger 360 */}
      <SlideOverDrawer
        isOpen={Boolean(selectedPassenger)}
        onClose={() => setSelectedPassenger(null)}
        title={selectedPassenger?.name || 'Yolcu 360° Bilgi Kartı'}
        subtitle={selectedPassenger ? `Öğrenci No: ${selectedPassenger.studentNo}` : undefined}
        badge={selectedPassenger ? <StatusBadge label={selectedPassenger.boardingStatus} variant="info" /> : undefined}
      >
        {selectedPassenger && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>ÖĞRENCİ SERVİS PLANI</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>
                <p><strong>Atanan Hat:</strong> {selectedPassenger.route}</p>
                <p><strong>Biniş Durağı:</strong> {selectedPassenger.stop}</p>
                <p><strong>Biniş Zamanı:</strong> {selectedPassenger.boardedAt || 'Henüz Binmedi'}</p>
                <p><strong>İniş Zamanı:</strong> {selectedPassenger.droppedOffAt || 'Henüz İnmedi'}</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>YETKİLİ VELİ VE TESLİMAT ŞARTI</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>
                <p><strong>Veli:</strong> {selectedPassenger.guardianName}</p>
                <p><strong>Telefon:</strong> {selectedPassenger.guardianPhone}</p>
                <p><strong>Teslimat Kuralı:</strong> {selectedPassenger.requiresHandover ? '4 Haneli PIN Kodlu El Sıkışma Zorunlu' : 'Muaf'}</p>
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
