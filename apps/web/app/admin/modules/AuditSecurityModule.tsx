'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, BILGEN_TOKENS } from '@bilgenos/ui';

export function AuditSecurityModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <KpiCard title="Toplam Denetim Kaydı" value="28,490 Olay" subtitle="Immutable Append-Only" badge={{ text: 'Veri Bütünlüğü: %100', variant: 'success' }} icon="🛡️" />
        <KpiCard title="BOLA / Cross-Tenant Engeli" value="14 Tehdit" subtitle="404 Maskelemesi Uygulandı" badge={{ text: 'Sızıntı Engellendi', variant: 'danger' }} icon="🚫" />
        <KpiCard title="Transactional Outbox" value="1,492 Event" subtitle="Zero-Loss Event Delivery" badge={{ text: 'Tam Senkron', variant: 'info' }} icon="📨" />
        <KpiCard title="BilgenOkul Eşleştirmeleri" value="842 Master" subtitle="Harici Varlık Referansları" badge={{ text: 'API Beklemede', variant: 'warning' }} icon="🔗" />
      </div>

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Olay adı, IP veya kullanıcı ara..."
      />

      <ExcelTable
        keyExtractor={(r: any) => r.id}
        data={[
          { id: 'aud-1', time: '2026-09-25 02:27:07', action: 'transport.boarding', decision: 'ALLOW', detail: 'Kerem Bilgen (STU-2026-0042) servis binişi onaylandı.' },
          { id: 'aud-2', time: '2026-09-25 02:27:08', action: 'person.read', decision: 'DENY', detail: 'Cross-tenant probe detected. Masked as 404 (Resource Not Found).' },
          { id: 'aud-3', time: '2026-09-25 02:27:08', action: 'vehicle.update', decision: 'DENY', detail: 'Cross-tenant mutation rejected by Scoped Repository.' },
        ]}
        columns={[
          { key: 'time', header: 'Zaman Damgası', width: '170px', isNumeric: true },
          { key: 'action', header: 'Eylem / Kaynak', width: '180px' },
          { key: 'decision', header: 'Karar', width: '110px', render: (row: any) => <StatusBadge label={row.decision} variant={row.decision === 'ALLOW' ? 'success' : 'danger'} /> },
          { key: 'detail', header: 'Güvenlik & İzolasyon Detayı' },
        ]}
      />
    </div>
  );
}
