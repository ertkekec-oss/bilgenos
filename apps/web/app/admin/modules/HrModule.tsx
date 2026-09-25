'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, BILGEN_TOKENS } from '@bilgenos/ui';

export function HrModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <KpiCard title="Toplam Çalışan Personel" value="142 Kişi" subtitle="124 Öğretmen, 18 İdari" badge={{ text: 'Doluluk: %98', variant: 'success' }} icon="👥" />
        <KpiCard title="Aktif Görevlendirme" value="156 Kadro" subtitle="Çoklu Kurum Dağılımı" badge={{ text: 'Kümülatif ≤ %100', variant: 'info' }} icon="📋" />
        <KpiCard title="Bugün İzinli Personel" value="3 Kişi" subtitle="2 Yıllık İzin, 1 Mazeret" badge={{ text: 'Maker-Checker Onaylı', variant: 'neutral' }} icon="🏖️" />
        <KpiCard title="Günlük Puantaj / Devam" value="%97.8" subtitle="Parmak İzi & Kartlı Giriş" badge={{ text: 'Puantaj Tam', variant: 'success' }} icon="⏱️" />
      </div>

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Sicil no, ad soyad veya branş ara..."
        primaryAction={{ label: '+ Personel İşe Giriş', onClick: () => alert('İşe Giriş Sihirbazı'), icon: '+' }}
      />

      <ExcelTable
        keyExtractor={(r: any) => r.empNo}
        data={[
          { empNo: 'EMP-001', name: 'Ahmet Yılmaz', dept: 'Lise Fen Bölümü', pos: 'Matematik Öğretmeni', type: 'INDEFINITE (Belirsiz Süreli)', workPct: '%100', status: 'ACTIVE' },
          { empNo: 'EMP-002', name: 'Zeynep Ak', dept: 'Yabancı Diller', pos: 'İngilizce Zümre Bşk.', type: 'INDEFINITE', workPct: '%100', status: 'ACTIVE' },
          { empNo: 'EMP-003', name: 'Mehmet Demir', dept: 'İdari İşler', pos: 'Ulaşım & Servis Şoförü', type: 'FIXED_TERM', workPct: '%100', status: 'ACTIVE' },
        ]}
        columns={[
          { key: 'empNo', header: 'Sicil No', width: '130px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.empNo}</strong> },
          { key: 'name', header: 'Ad Soyad', width: '200px' },
          { key: 'dept', header: 'Departman (İK-002)', width: '180px' },
          { key: 'pos', header: 'Pozisyon / Unvan', width: '200px' },
          { key: 'type', header: 'Sözleşme Türü', width: '180px' },
          { key: 'workPct', header: 'İstihdam %', width: '110px', isNumeric: true },
          { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
        ]}
      />
    </div>
  );
}
