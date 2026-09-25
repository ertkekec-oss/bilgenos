'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, BILGEN_TOKENS } from '@bilgenos/ui';

export function AcademicCommercialModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <KpiCard title="Aktif Eğitim Kurumları" value="3 Kurum" subtitle="Fen Lisesi, YKS, Dil" badge={{ text: '5 Kampüs', variant: 'info' }} icon="🏫" />
        <KpiCard title="Kayıtlı Öğrenciler" value="842 Öğrenci" subtitle="Aktif Öğrenim Gören" badge={{ text: 'Doluluk: %94', variant: 'success' }} icon="🎓" />
        <KpiCard title="Aday Başvuru Havuzu (CRM)" value="128 Aday" subtitle="Görüşme ve Mülakatta" badge={{ text: 'Dönüşüm: %32', variant: 'warning' }} icon="📝" />
        <KpiCard title="Sözleşme Hacmi" value="48.5M ₺" subtitle="2026-2027 Eğitim Dönemi" badge={{ text: 'Taahhüt Alındı', variant: 'neutral' }} icon="📜" />
      </div>

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Kurum adı, program veya öğrenci ara..."
        primaryAction={{ label: '+ Yeni Kayıt Başlat', onClick: () => alert('Kayıt Sihirbazı'), icon: '+' }}
      />

      <ExcelTable
        keyExtractor={(r: any) => r.code}
        data={[
          { code: 'BILGEN-KOLEJ', name: 'Bilgen Fen ve Anadolu Lisesi', type: 'COLLEGE', capacity: '450 Öğrenci', activeEnr: '412', status: 'ACTIVE' },
          { code: 'BILGEN-YKS', name: 'Bilgen YKS Hazırlık Merkezi', type: 'EXAM_PREP_CENTER', capacity: '300 Öğrenci', activeEnr: '280', status: 'ACTIVE' },
          { code: 'BILGEN-DIL', name: 'Bilgen Yabancı Dil Akademisi', type: 'LANGUAGE_SCHOOL', capacity: '200 Öğrenci', activeEnr: '150', status: 'ACTIVE' },
        ]}
        columns={[
          { key: 'code', header: 'Kurum Kodu', width: '170px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.code}</strong> },
          { key: 'name', header: 'Kurum Ünvanı', width: '280px' },
          { key: 'type', header: 'Kurum Türü', width: '180px' },
          { key: 'capacity', header: 'Kapasite', width: '130px', isNumeric: true },
          { key: 'activeEnr', header: 'Kayıtlı', width: '100px', isNumeric: true },
          { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
        ]}
      />
    </div>
  );
}
