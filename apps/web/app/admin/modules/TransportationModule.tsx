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

  // Interactive Live Trip & Passenger State
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
      guardianName: 'Fatma Bilgen (Anne)',
      guardianPhone: '+90 555 222 3344',
      handoverVerified: false,
    },
    {
      id: 'pass-2',
      studentNo: 'STU-2026-0089',
      name: 'Zeynep Kaya',
      route: 'GZ-01-KADIKOY',
      stop: 'Kadıköy Rıhtım İskele',
      boardingStatus: 'DROPPED_OFF',
      boardedAt: '07:16:22',
      droppedOffAt: '08:02:18',
      requiresHandover: true,
      guardianName: 'Murat Kaya (Baba)',
      guardianPhone: '+90 555 444 5566',
      handoverVerified: true,
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
      guardianName: 'Selin Özdemir (Veli)',
      guardianPhone: '+90 555 777 8899',
      handoverVerified: false,
    },
  ]);

  // Drawer & Modal State
  const [selectedPassenger, setSelectedPassenger] = useState<typeof passengers[0] | null>(null);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleStartTrip = (tripId: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'IN_PROGRESS' } : t));
    showNotice('Sefer başarıyla başlatıldı ve yolcu listesi donduruldu (TRN-019).');
  };

  const handleBoardPassenger = (passId: string) => {
    const time = new Date().toTimeString().split(' ')[0];
    setPassengers(prev => prev.map(p => p.id === passId ? { ...p, boardingStatus: 'BOARDED', boardedAt: time } : p));
    if (selectedPassenger && selectedPassenger.id === passId) {
      setSelectedPassenger(prev => prev ? { ...prev, boardingStatus: 'BOARDED', boardedAt: time } : null);
    }
    showNotice('Öğrenci binişi kaydedildi (TRN-022: Mükerrer biniş engellendi).');
  };

  const handleDropoffPassenger = (passId: string) => {
    const time = new Date().toTimeString().split(' ')[0];
    setPassengers(prev => prev.map(p => p.id === passId ? { ...p, boardingStatus: 'DROPPED_OFF', droppedOffAt: time } : p));
    if (selectedPassenger && selectedPassenger.id === passId) {
      setSelectedPassenger(prev => prev ? { ...prev, boardingStatus: 'DROPPED_OFF', droppedOffAt: time } : null);
    }
    showNotice('Öğrenci inişi kaydedildi. Veli teslim şartı aranıyor (TRN-024).');
  };

  const handleConfirmHandover = () => {
    if (!selectedPassenger) return;
    if (pinInput !== '1234' && pinInput !== '9876') {
      alert('Geçersiz Veli Doğrulama Kodu (PIN)! Lütfen velinin SMS ile aldığı 4 haneli PIN kodunu giriniz (Demo: 1234).');
      return;
    }
    setPassengers(prev => prev.map(p => p.id === selectedPassenger.id ? { ...p, handoverVerified: true } : p));
    setSelectedPassenger(prev => prev ? { ...prev, handoverVerified: true } : null);
    setIsHandoverModalOpen(false);
    setPinInput('');
    showNotice('Güvenli Veli Teslimatı doğrulandı ve denetim izine kaydedildi (TRN-024, TRN-036).');
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
            zIndex: 100,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: BILGEN_TOKENS.shadows.lg,
            borderLeft: `4px solid ${BILGEN_TOKENS.colors.success}`,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          ✓ {actionNotice}
        </div>
      )}

      {/* KPI Cards Row */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <KpiCard
          title="Toplam Servis Filosu"
          value="14 Araç"
          subtitle="12 Özmal, 2 Taşeron"
          badge={{ text: 'Kapasite: 284 Koltuk', variant: 'info' }}
          icon="🚐"
        />
        <KpiCard
          title="Canlı Aktif Seferler"
          value={trips.filter(t => t.status === 'IN_PROGRESS').length}
          subtitle="Sabah Vardiyası Ringleri"
          badge={{ text: '1 Sefer Tamamlandı', variant: 'success' }}
          icon="📍"
        />
        <KpiCard
          title="Servisteki Yolcu"
          value={passengers.filter(p => p.boardingStatus === 'BOARDED').length}
          subtitle="Taşınan Toplam: 3 Öğrenci"
          badge={{ text: '1 İndi / Teslim Edildi', variant: 'neutral' }}
          icon="🎒"
        />
        <KpiCard
          title="Güvenli Veli Teslimatı"
          value={passengers.filter(p => p.requiresHandover && !p.handoverVerified).length}
          subtitle="Veli Teslim Bekleyen"
          badge={{ text: 'PIN/İmza Zorunlu', variant: 'warning' }}
          icon="🛡️"
        />
      </div>

      {/* Sub-Tab 1: Canlı Sefer & Teslimat */}
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
              onClick: () => handleStartTrip('tr-1'),
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
                    onClick={() => setSelectedPassenger(passengers[0])}
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

          <div style={{ marginTop: '24px', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '13px', margin: '0 0 4px 0', fontWeight: 700, color: BILGEN_TOKENS.colors.textPrimary }}>
              Anlık Yolcu Manifestosu & Veli Güvenlik Durumu (Live Manifest & Safe Handover)
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: BILGEN_TOKENS.colors.textSecondary }}>
              Bir öğrenciye tıklayarak sağ panelden biniş/iniş kaydı alabilir veya güvenli veli teslimatını onaylayabilirsiniz.
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
                width: '180px',
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
                width: '140px',
                align: 'center',
                render: (row) => (
                  <button
                    onClick={() => setSelectedPassenger(row)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: row.boardingStatus === 'PENDING' ? '#2563EB' : (row.boardingStatus === 'BOARDED' ? '#F59E0B' : '#10B981'),
                      color: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    {row.boardingStatus === 'PENDING' ? 'Biniş Al' : (row.boardingStatus === 'BOARDED' ? 'İndir' : 'Teslim Et')}
                  </button>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Sub-Tab 2: Güzergahlar & Duraklar */}
      {activeSubTab === 'TRN_ROUTES' && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Güzergah kodu veya durak ara..."
            primaryAction={{
              label: '+ Yeni Güzergah Tanımla',
              onClick: () => showNotice('Yeni Güzergah modalı açıldı.'),
              icon: '+',
            }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.code}
            data={[
              { code: 'GZ-01-KADIKOY', name: 'Kadıköy - Ataşehir - Kampüs Sabah', stops: 4, duration: '45 dk', distance: '18.4 km', status: 'ACTIVE' },
              { code: 'GZ-02-USKUDAR', name: 'Üsküdar - Çamlıca - Kampüs Sabah', stops: 3, duration: '35 dk', distance: '14.2 km', status: 'ACTIVE' },
              { code: 'GZ-03-MALTEPE', name: 'Maltepe - Bostancı - Kampüs Sabah', stops: 5, duration: '50 dk', distance: '21.0 km', status: 'ACTIVE' },
              { code: 'GZ-01-AKSAM', name: 'Kampüs - Ataşehir - Kadıköy Akşam', stops: 4, duration: '50 dk', distance: '19.1 km', status: 'ACTIVE' },
            ]}
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

      {/* Sub-Tab 3: Araç Filosu & Sürücüler */}
      {activeSubTab === 'TRN_FLEET' && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Plaka, şasi veya sürücü ara..."
            primaryAction={{
              label: '+ Yeni Araç Ekle',
              onClick: () => showNotice('Yeni Araç Kaydı modalı açıldı.'),
              icon: '+',
            }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.plate}
            data={[
              { plate: '34 BLG 101', type: 'MIDIBUS (27 Kişilik)', seatCap: 27, effCap: 26, owner: 'Özmal (Asset Ref: AST-VEH-001)', insp: '2027-04-15', status: 'ACTIVE' },
              { plate: '34 TRN 882', type: 'MINIBUS (16 Kişilik)', seatCap: 16, effCap: 15, owner: 'Özlem Taşımacılık A.Ş.', insp: '2026-11-20', status: 'ACTIVE' },
              { plate: '34 BLG 205', type: 'BUS (45 Kişilik)', seatCap: 45, effCap: 43, owner: 'Özmal (Asset Ref: AST-VEH-002)', insp: '2027-01-10', status: 'ACTIVE' },
            ]}
            columns={[
              { key: 'plate', header: 'Plaka No', width: '140px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.plate}</strong> },
              { key: 'type', header: 'Araç Türü', width: '180px' },
              { key: 'seatCap', header: 'Koltuk', width: '90px', isNumeric: true },
              { key: 'effCap', header: 'Efektif Kapasite', width: '130px', isNumeric: true },
              { key: 'owner', header: 'Mülkiyet / Sağlayıcı', width: '240px' },
              { key: 'insp', header: 'Muayene Tarihi', width: '140px', isNumeric: true },
              { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
            ]}
          />
        </div>
      )}

      {/* Sub-Tab 4: Yolcu Listesi & Zimmet */}
      {activeSubTab === 'TRN_PASSENGERS' && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Öğrenci no, ad veya durak ara..."
            primaryAction={{
              label: '+ Öğrenciye Servis Ata',
              onClick: () => showNotice('Öğrenci Servis Atama Sihirbazı açıldı.'),
              icon: '+',
            }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={passengers}
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

      {/* Master-Detail Slide-Over Drawer (Passenger / Trip 360°) */}
      <SlideOverDrawer
        isOpen={Boolean(selectedPassenger)}
        onClose={() => setSelectedPassenger(null)}
        title={selectedPassenger?.name || 'Yolcu 360° Operasyon Kartı'}
        subtitle={selectedPassenger ? `Öğrenci No: ${selectedPassenger.studentNo} | Güzergah: ${selectedPassenger.route}` : undefined}
        badge={selectedPassenger ? <StatusBadge label={selectedPassenger.boardingStatus} variant={selectedPassenger.boardingStatus === 'BOARDED' ? 'warning' : (selectedPassenger.boardingStatus === 'DROPPED_OFF' ? 'success' : 'default')} /> : undefined}
        footerActions={
          selectedPassenger && (
            <>
              {selectedPassenger.boardingStatus === 'PENDING' && (
                <button
                  onClick={() => handleBoardPassenger(selectedPassenger.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  ✓ Araca Bindi Olarak İşle
                </button>
              )}
              {selectedPassenger.boardingStatus === 'BOARDED' && (
                <button
                  onClick={() => handleDropoffPassenger(selectedPassenger.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#F59E0B',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  ✓ Durakta İndi Olarak İşle
                </button>
              )}
              {selectedPassenger.boardingStatus === 'DROPPED_OFF' && selectedPassenger.requiresHandover && !selectedPassenger.handoverVerified && (
                <button
                  onClick={() => setIsHandoverModalOpen(true)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  🛡️ Veli Teslimatını Onayla (PIN/İmza)
                </button>
              )}
            </>
          )
        }
      >
        {selectedPassenger && (
          <div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Operasyonel Durum
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px', fontSize: '12px' }}>
                <div><strong>Biniş Saati:</strong> {selectedPassenger.boardedAt || 'Henüz Binmedi'}</div>
                <div><strong>İniş Saati:</strong> {selectedPassenger.droppedOffAt || 'Henüz İnmedi'}</div>
                <div><strong>Durak Adı:</strong> {selectedPassenger.stop}</div>
                <div><strong>Veli Şartı:</strong> {selectedPassenger.requiresHandover ? 'Zorunlu (1. Kademe)' : 'Serbest İniş'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Yetkili Teslim Alma İzinleri (Handover Authorizations)
              </h4>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '12px' }}>{selectedPassenger.guardianName}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>İletişim: {selectedPassenger.guardianPhone}</div>
                  </div>
                  <StatusBadge label="YASAL VELİ" variant="success" />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: selectedPassenger.handoverVerified ? '#ECFDF5' : '#FFFBEB', padding: '12px', borderRadius: '6px', border: `1px solid ${selectedPassenger.handoverVerified ? '#A7F3D0' : '#FDE68A'}` }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: selectedPassenger.handoverVerified ? '#065F46' : '#92400E' }}>
                {selectedPassenger.handoverVerified ? '✓ Veli Güvenli Teslimatı Doğrulandı' : '⚠️ Güvenli Teslimat Henüz Tamamlanmadı'}
              </div>
              <div style={{ fontSize: '11px', color: selectedPassenger.handoverVerified ? '#047857' : '#B45309', marginTop: '4px' }}>
                {selectedPassenger.handoverVerified
                  ? 'Öğrenci yetkili velisine PIN doğrulaması ile imza karşılığı eksiksiz teslim edilmiştir.'
                  : 'Öğrenci 1. kademe olduğu için velisi olmadan veya PIN doğrulanmadan serbest bırakılamaz (TRN-024).'}
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* Safe Handover Verification Modal (PIN / Physical Signature) */}
      <ModalDialog
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        title="Veli Güvenli Teslimat Doğrulaması (Safe Handover)"
        description="Öğrencinin yetkili kişiye teslim edildiğini doğrulamak için velinin telefonuna iletilen 4 haneli PIN kodunu giriniz."
        onConfirm={handleConfirmHandover}
        confirmText="Doğrula ve Teslim Et"
        confirmVariant="success"
      >
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Veli Doğrulama Kodu (PIN) (Demo için: 1234):
            </label>
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                fontSize: '18px',
                letterSpacing: '0.3em',
                textAlign: 'center',
                fontFamily: BILGEN_TOKENS.typography.fontFamilyMono,
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Yetkili Kişi: <strong>{selectedPassenger?.guardianName}</strong><br />
            Doğrulama Yöntemi: <strong>SMS PIN + Rehber Personel Görsel Teyidi</strong>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
