'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, BILGEN_TOKENS } from '@bilgenos/ui';

export function FinanceModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <KpiCard title="Operasyonel Kasa & Banka" value="4,820,500 ₺" subtitle="Nakit & Sanal POS Havuzu" badge={{ text: 'Mutabık', variant: 'success' }} icon="💳" />
        <KpiCard title="Bugünkü Tahsilat Hacmi" value="142,000 ₺" subtitle="18 İşlem Kaydı" badge={{ text: 'Mahsup Tamamlandı', variant: 'info' }} icon="📥" />
        <KpiCard title="Vadesi Gelen Taksitler" value="385,000 ₺" subtitle="24 Öğrenci Ödemesi" badge={{ text: 'Vade: 7 Gün', variant: 'warning' }} icon="📅" />
        <KpiCard title="Operasyonel Defter (Journal)" value="1,842 Kayıt" subtitle="Immutable Finansal İz" badge={{ text: 'Ters Kayıt Korumalı', variant: 'neutral' }} icon="📖" />
      </div>

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Fiş no, veli adı veya işlem ara..."
        primaryAction={{ label: '+ Hızlı Tahsilat Al', onClick: () => alert('Tahsilat Sihirbazı'), icon: '+' }}
      />

      <ExcelTable
        keyExtractor={(r: any) => r.id}
        data={[
          { id: 'tx-1', date: '2026-09-25 09:14', student: 'Kerem Bilgen (STU-2026-0042)', amount: '25,000.00 ₺', account: 'Garanti BBVA Ana Hesap', type: 'COLLECTION', status: 'ALLOCATED' },
          { id: 'tx-2', date: '2026-09-25 10:20', student: 'Zeynep Kaya (STU-2026-0089)', amount: '18,500.00 ₺', account: 'İş Bankası Sanal POS', type: 'COLLECTION', status: 'ALLOCATED' },
        ]}
        columns={[
          { key: 'date', header: 'İşlem Zamanı', width: '160px', isNumeric: true },
          { key: 'student', header: 'Öğrenci / Borçlu', width: '260px' },
          { key: 'amount', header: 'Tutar', width: '140px', isNumeric: true, render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.amount}</strong> },
          { key: 'account', header: 'Hedef Hesap', width: '220px' },
          { key: 'type', header: 'Tür', width: '130px' },
          { key: 'status', header: 'Mahsup Durumu', width: '130px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
        ]}
      />
    </div>
  );
}
