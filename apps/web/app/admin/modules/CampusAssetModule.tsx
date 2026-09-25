'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, SlideOverDrawer, BILGEN_TOKENS } from '@bilgenos/ui';

export function CampusAssetModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const assets = [
    {
      id: 'ast-1',
      assetNumber: 'AST-2026-0001',
      name: 'Dell Latitude 5540 Laptop',
      category: 'BT Donanım',
      custodian: 'Ahmet Yılmaz (Matematik Öğrt.)',
      space: 'Oda 204 (Öğretmenler Odası)',
      status: 'IN_USE',
      warranty: '2028-09-01',
    },
    {
      id: 'ast-2',
      assetNumber: 'AST-2026-0002',
      name: 'Epson EB-2250U Projeksiyon Cihazı',
      category: 'Görsel/İşitsel',
      custodian: 'Zeynep Ak (Laboratuvar Sorumlusu)',
      space: 'Fen Laboratuvarı 1',
      status: 'IN_USE',
      warranty: '2027-05-15',
    },
    {
      id: 'ast-3',
      assetNumber: 'AST-2026-0003',
      name: 'Canon imageRUNNER Fotokopi Makinesi',
      category: 'Ofis Ekipmanı',
      custodian: 'İdari İşler Sorumlusu',
      space: 'Zemin Kat Fotokopi Odası',
      status: 'MAINTENANCE',
      warranty: '2026-12-31',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <KpiCard title="Demirbaş Varlık Toplamı" value="1,248 Kalem" subtitle="Kayıtlı ve Etiketli" badge={{ text: 'Değer: 8.4M ₺', variant: 'info' }} icon="💻" />
        <KpiCard title="Zimmetli Varlıklar" value="1,112 Adet" subtitle="%89.1 Personel Zimmetinde" badge={{ text: 'Aktif Zimmet', variant: 'success' }} icon="👤" />
        <KpiCard title="Bakım / Servisteki Kalemler" value="14 Cihaz" subtitle="Yetkili Servis Aşamasında" badge={{ text: 'SLA Takipte', variant: 'warning' }} icon="🔧" />
        <KpiCard title="Kampüsler Arası Transfer" value="2 Talep" subtitle="Onay Bekleyen Transfer" badge={{ text: 'Maker-Checker', variant: 'neutral' }} icon="🔄" />
      </div>

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Varlık no, marka veya zimmetli personel ara..."
        primaryAction={{ label: '+ Yeni Varlık Kaydet', onClick: () => alert('Yeni Varlık Ekleme Modalı'), icon: '+' }}
      />

      <ExcelTable
        keyExtractor={(r: any) => r.id}
        data={assets.filter(a => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()))}
        columns={[
          { key: 'assetNumber', header: 'Varlık No', width: '150px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.assetNumber}</strong> },
          {
            key: 'name',
            header: 'Varlık Tanımı & Model',
            width: '240px',
            render: (row: any) => (
              <span onClick={() => setSelectedAsset(row)} style={{ fontWeight: 600, color: BILGEN_TOKENS.colors.accent, cursor: 'pointer', textDecoration: 'underline' }}>
                {row.name}
              </span>
            ),
          },
          { key: 'category', header: 'Kategori', width: '140px' },
          { key: 'custodian', header: 'Zimmet Sahibi (PHY-008)', width: '220px' },
          { key: 'space', header: 'Fiziki Konum (Space)', width: '200px' },
          { key: 'status', header: 'Durum', width: '110px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'IN_USE' ? 'success' : 'warning'} /> },
          {
            key: 'action',
            header: 'İncele',
            width: '100px',
            align: 'center',
            render: (row: any) => (
              <button
                onClick={() => setSelectedAsset(row)}
                style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              >
                360° Detay
              </button>
            ),
          },
        ]}
      />

      {/* Asset 360 SlideOverDrawer */}
      <SlideOverDrawer
        isOpen={Boolean(selectedAsset)}
        onClose={() => setSelectedAsset(null)}
        title={selectedAsset?.name || 'Demirbaş 360° İnceleme'}
        subtitle={selectedAsset ? `Varlık No: ${selectedAsset.assetNumber} | Kategori: ${selectedAsset.category}` : undefined}
        badge={selectedAsset ? <StatusBadge label={selectedAsset.status} variant="success" /> : undefined}
      >
        {selectedAsset && (
          <div>
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Fiziki Konum & Sorumluluk Ayrımı (PHY-008)</div>
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <p><strong>Mevcut Mekan (Space):</strong> {selectedAsset.space}</p>
                <p><strong>Zimmetli Personel:</strong> {selectedAsset.custodian}</p>
                <p><strong>Garanti Bitiş:</strong> {selectedAsset.warranty}</p>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              * Konum değişikliği zimmeti etkilemez; zimmet devri cihazı fiziki olarak taşımaz (PHY-008).
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
