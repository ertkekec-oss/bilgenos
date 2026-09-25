'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, BILGEN_TOKENS } from '@bilgenos/ui';

export function AuditSecurityModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const [auditLogs] = useState([
    { id: 'aud-1', time: '2026-09-25 03:01:20', user: 'Kerem Bilgen (Admin)', module: 'TRANSPORTATION', action: 'START_TRIP', target: 'TRIP-20260925-GZ01-M', ip: '192.168.1.100', outcome: 'SUCCESS' },
    { id: 'aud-2', time: '2026-09-25 02:45:12', user: 'Ahmet Yılmaz (Sürücü)', module: 'TRANSPORTATION', action: 'RECORD_BOARDING', target: 'STU-2026-0042', ip: '172.16.0.45', outcome: 'SUCCESS' },
    { id: 'aud-3', time: '2026-09-25 02:10:05', user: 'Sistem Robotu', module: 'SECURITY', action: 'BOLA_ENFORCEMENT', target: 'Tenant B -> Tenant A Access Blocked', ip: '10.0.0.99', outcome: 'BLOCKED (404)' },
  ]);

  const [integrations, setIntegrations] = useState([
    { id: 'int-1', system: 'BilgenOkul Öğrenci Bilgi Sistemi (OBS)', type: 'REST_WEBHOOK', endpoint: 'https://api.bilgenokul.k12.tr/v1/sync', status: 'SYNCED', lastSync: '10 dakika önce' },
    { id: 'int-2', system: 'MEB MEBBİS / E-Okul Entegrasyon Kapısı', type: 'SOAP_SERVICE', endpoint: 'https://mebbis.meb.gov.tr/api/v2', status: 'ACTIVE', lastSync: '1 saat önce' },
    { id: 'int-3', system: 'İYS (İleti Yönetim Sistemi - SMS)', type: 'REST_API', endpoint: 'https://iys.org.tr/api/v1/consent', status: 'ACTIVE', lastSync: '3 saat önce' },
  ]);

  const handleSyncNow = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, lastSync: 'Az önce', status: 'SYNCED' } : i));
    showNotice('Entegrasyon senkronizasyonu tetiklendi ve veriler güncellendi.');
  };

  return (
    <div>
      {actionNotice && (
        <div style={{ position: 'fixed', top: '56px', right: '24px', zIndex: 9999, backgroundColor: '#0F172A', color: '#FFFFFF', padding: '12px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, borderLeft: `4px solid ${BILGEN_TOKENS.colors.success}` }}>
          ✓ {actionNotice}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <KpiCard title="Denetim İzi Kaydı" value="18,420 Olay" subtitle="Son 30 Günlük Log" badge={{ text: 'Değiştirilemez', variant: 'info' }} icon="🛡️" />
        <KpiCard title="BOLA Engelleme Kalkanı" value="0 İhlal" subtitle="Çoklu Kurum İzolasyonu" badge={{ text: 'Aktif Koruma', variant: 'success' }} icon="🔒" />
        <KpiCard title="Entegrasyon Servisleri" value="3 Servis" subtitle="BilgenOkul Hub" badge={{ text: 'Senkronize', variant: 'success' }} icon="🌐" />
        <KpiCard title="Sistem Sağlığı" value="%99.99" subtitle="Uptime & SLA" badge={{ text: 'Mükemmel', variant: 'success' }} icon="⚡" />
      </div>

      {/* SUB-TAB 1: SEC_AUDIT */}
      {(activeSubTab === 'SEC_AUDIT' || !activeSubTab) && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Kullanıcı, eylem veya IP ara..." />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={auditLogs}
            columns={[
              { key: 'time', header: 'Olay Zamanı', width: '180px', isNumeric: true },
              { key: 'user', header: 'İşlemi Yapan Kullanıcı', width: '200px' },
              { key: 'module', header: 'Modül', width: '150px' },
              { key: 'action', header: 'Eylem Türü', width: '170px' },
              { key: 'target', header: 'Hedef Kaynak', width: '240px' },
              { key: 'ip', header: 'Kaynak IP', width: '130px', isNumeric: true },
              { key: 'outcome', header: 'Sonuç', width: '140px', render: (row: any) => <StatusBadge label={row.outcome} variant={row.outcome === 'SUCCESS' ? 'success' : 'danger'} /> },
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 2: SEC_INTEGRATION */}
      {activeSubTab === 'SEC_INTEGRATION' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Entegrasyon ara..." />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={integrations}
            columns={[
              { key: 'system', header: 'Harici Sistem Adı', width: '280px' },
              { key: 'type', header: 'Protokol', width: '140px' },
              { key: 'endpoint', header: 'Servis Uç Noktası', width: '280px', render: (row: any) => <span style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono, fontSize: '11px' }}>{row.endpoint}</span> },
              { key: 'lastSync', header: 'Son Senkronizasyon', width: '160px' },
              { key: 'status', header: 'Durum', width: '120px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
              {
                key: 'action', header: 'Tetikle', width: '150px', align: 'center',
                render: (row: any) => (
                  <button onClick={() => handleSyncNow(row.id)} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', cursor: 'pointer' }}>
                    🔄 Şimdi Eşle
                  </button>
                )
              }
            ]}
          />
        </div>
      )}
    </div>
  );
}
