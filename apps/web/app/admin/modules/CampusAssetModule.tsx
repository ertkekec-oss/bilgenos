'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, SlideOverDrawer, ModalDialog, BILGEN_TOKENS } from '@bilgenos/ui';

export function CampusAssetModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Modals & Drawers
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [newAssetForm, setNewAssetForm] = useState({ name: 'Apple iPad 10.9 (Eğitim Seti)', category: 'BT Donanım', space: 'B Blok - Robotik Atölyesi', custodian: 'Mehmet Demir' });

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [newTransferForm, setNewTransferForm] = useState({ assetName: 'Dell Latitude 5540 Laptop', fromSpace: 'Öğretmenler Odası 204', toSpace: 'A Blok Fen Lab', requester: 'Ahmet Yılmaz' });

  const [isAddSpaceModalOpen, setIsAddSpaceModalOpen] = useState(false);
  const [newSpaceForm, setNewSpaceForm] = useState({ campus: 'Merkez Kampüs', building: 'B Blok', floor: '1. Kat', code: 'B-105', name: 'Görsel Sanatlar Atölyesi', type: 'ATELIER', capacity: 25, area: '65 m²' });

  // Datasets
  const [assets, setAssets] = useState([
    { id: 'ast-1', assetNumber: 'AST-2026-0001', name: 'Dell Latitude 5540 Laptop', category: 'BT Donanım', custodian: 'Ahmet Yılmaz (Matematik Öğrt.)', space: 'Oda 204 (Öğretmenler Odası)', status: 'IN_USE', warranty: '2028-09-01' },
    { id: 'ast-2', assetNumber: 'AST-2026-0002', name: 'Epson EB-2250U Projeksiyon Cihazı', category: 'Görsel/İşitsel', custodian: 'Zeynep Ak (Laboratuvar Sorumlusu)', space: 'Fen Laboratuvarı 1', status: 'IN_USE', warranty: '2027-05-15' },
    { id: 'ast-3', assetNumber: 'AST-2026-0003', name: 'Canon imageRUNNER Fotokopi Makinesi', category: 'Ofis Ekipmanı', custodian: 'İdari İşler Sorumlusu', space: 'Zemin Kat Fotokopi Odası', status: 'MAINTENANCE', warranty: '2026-12-31' },
    { id: 'ast-4', assetNumber: 'AST-2026-0004', name: '3D Yazıcı Creality K1 Max', category: 'Laboratuvar', custodian: 'Alp Tekin (Robotik Eğitmeni)', space: 'Robotik Atölyesi', status: 'IN_USE', warranty: '2027-11-01' },
  ]);

  const [custodies, setCustodies] = useState([
    { id: 'cst-1', assetNumber: 'AST-2026-0001', assetName: 'Dell Latitude 5540 Laptop', custodian: 'Ahmet Yılmaz', dept: 'Matematik Bölümü', assignedAt: '2026-01-15', status: 'ACTIVE' },
    { id: 'cst-2', assetNumber: 'AST-2026-0002', assetName: 'Epson EB-2250U Projeksiyon', custodian: 'Zeynep Ak', dept: 'Fen Bilimleri', assignedAt: '2026-02-01', status: 'ACTIVE' },
    { id: 'cst-3', assetNumber: 'AST-2026-0004', assetName: '3D Yazıcı Creality K1 Max', custodian: 'Alp Tekin', dept: 'Bilişim Teknolojileri', assignedAt: '2026-03-10', status: 'ACTIVE' },
  ]);

  const [transfers, setTransfers] = useState([
    { id: 'trf-1', trfNo: 'TRF-2026-0012', asset: 'Dell Latitude 5540 Laptop', fromSpace: 'Öğretmenler Odası', toSpace: 'YKS Hazırlık Merkezi', requester: 'Ahmet Yılmaz', approver: 'Sistem Yöneticisi', status: 'PENDING_APPROVAL' },
    { id: 'trf-2', trfNo: 'TRF-2026-0008', asset: 'Epson Projeksiyon Cihazı', fromSpace: 'Depo', toSpace: 'Konferans Salonu', requester: 'Caner Özdemir', approver: 'Kerem Bilgen', status: 'APPROVED' },
  ]);

  const [spaces, setSpaces] = useState([
    { id: 'sp-101', campus: 'Merkez Kampüs', building: 'A Blok', floor: '2. Kat', code: 'A-204', name: 'Fizik & Robotik Laboratuvarı', type: 'LABORATORY', capacity: 32, area: '84 m²', status: 'ACTIVE' },
    { id: 'sp-102', campus: 'Merkez Kampüs', building: 'A Blok', floor: '1. Kat', code: 'A-102', name: '10-A Anadolu Sınıfı', type: 'CLASSROOM', capacity: 24, area: '56 m²', status: 'ACTIVE' },
    { id: 'sp-103', campus: 'Merkez Kampüs', building: 'B Blok', floor: 'Zemin', code: 'B-001', name: 'Merkez Konferans Salonu', type: 'AUDITORIUM', capacity: 220, area: '280 m²', status: 'ACTIVE' },
  ]);

  const handleReturnCustody = (id: string) => {
    setCustodies(prev => prev.map(c => c.id === id ? { ...c, status: 'RETURNED' } : c));
    showNotice('Zimmet başarıyla iade alındı ve demirbaş depoya çekildi.');
  };

  const handleApproveTransfer = (id: string) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t));
    showNotice('Transfer Maker-Checker prensibiyle onaylandı ve fiziksel hareket tamamlandı (PHY-008).');
  };

  const handleAddAsset = () => {
    const newA = {
      id: `ast-${Date.now()}`,
      assetNumber: `AST-2026-00${assets.length + 1}`,
      name: newAssetForm.name,
      category: newAssetForm.category,
      custodian: newAssetForm.custodian,
      space: newAssetForm.space,
      status: 'IN_USE',
      warranty: '2028-09-01',
    };
    setAssets(prev => [newA, ...prev]);
    setIsAddAssetModalOpen(false);
    showNotice(`${newA.name} başarıyla demirbaşa kaydedildi.`);
  };

  const handleCreateTransfer = () => {
    const newT = {
      id: `trf-${Date.now()}`,
      trfNo: `TRF-2026-00${transfers.length + 1}`,
      asset: newTransferForm.assetName,
      fromSpace: newTransferForm.fromSpace,
      toSpace: newTransferForm.toSpace,
      requester: newTransferForm.requester,
      approver: 'Onay Bekliyor',
      status: 'PENDING_APPROVAL',
    };
    setTransfers(prev => [newT, ...prev]);
    setIsTransferModalOpen(false);
    showNotice('Yeni transfer talebi oluşturuldu, çift onay bekleniyor.');
  };

  const handleAddSpace = () => {
    setSpaces(prev => [...prev, { ...newSpaceForm, id: `sp-${Date.now()}`, status: 'ACTIVE' }]);
    setIsAddSpaceModalOpen(false);
    showNotice(`${newSpaceForm.code} nolu mekan sisteme eklendi.`);
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
        <KpiCard title="Demirbaş Varlık Toplamı" value={`${assets.length + 1244} Kalem`} subtitle="Kayıtlı ve Etiketli" badge={{ text: 'Değer: 8.4M ₺', variant: 'info' }} icon="💻" />
        <KpiCard title="Zimmetli Varlıklar" value={`${custodies.filter(c => c.status === 'ACTIVE').length + 1109} Adet`} subtitle="%89.1 Personel Zimmetinde" badge={{ text: 'Aktif Zimmet', variant: 'success' }} icon="👤" />
        <KpiCard title="Transfer Talepleri" value={`${transfers.filter(t => t.status === 'PENDING_APPROVAL').length} Bekleyen`} subtitle="Maker-Checker Onayında" badge={{ text: 'Çift Kontrol', variant: 'warning' }} icon="🔄" />
        <KpiCard title="Tanımlı Mekan Sayısı" value={`${spaces.length + 38} Mekan`} subtitle="Derslik, Lab, İdari" badge={{ text: 'Kapasite: 1,420', variant: 'neutral' }} icon="🏢" />
      </div>

      {/* SUB-TAB 1: AST_INVENTORY */}
      {(activeSubTab === 'AST_INVENTORY' || !activeSubTab) && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Varlık no, marka veya zimmetli personel ara..."
            primaryAction={{ label: '+ Yeni Varlık Kaydet', onClick: () => setIsAddAssetModalOpen(true), icon: '+' }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={assets.filter(a => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()))}
            columns={[
              { key: 'assetNumber', header: 'Varlık No', width: '150px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.assetNumber}</strong> },
              { key: 'name', header: 'Varlık Tanımı & Model', width: '250px', render: (row: any) => <span onClick={() => setSelectedAsset(row)} style={{ fontWeight: 600, color: BILGEN_TOKENS.colors.accent, cursor: 'pointer', textDecoration: 'underline' }}>{row.name}</span> },
              { key: 'category', header: 'Kategori', width: '140px' },
              { key: 'custodian', header: 'Zimmet Sahibi (PHY-008)', width: '220px' },
              { key: 'space', header: 'Fiziki Konum', width: '200px' },
              { key: 'status', header: 'Durum', width: '110px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'IN_USE' ? 'success' : 'warning'} /> },
              {
                key: 'action', header: 'İncele', width: '110px', align: 'center',
                render: (row: any) => <button onClick={() => setSelectedAsset(row)} style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}>🔍 360° Detay</button>
              },
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 2: AST_CUSTODY */}
      {activeSubTab === 'AST_CUSTODY' && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Zimmet no veya personel ara..."
            primaryAction={{ label: '+ Yeni Zimmet Ver', onClick: () => alert('Yeni Zimmet Formu'), icon: '+' }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={custodies}
            columns={[
              { key: 'assetNumber', header: 'Varlık No', width: '150px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.assetNumber}</strong> },
              { key: 'assetName', header: 'Demirbaş Adı', width: '240px' },
              { key: 'custodian', header: 'Zimmetli Personel', width: '200px' },
              { key: 'dept', header: 'Departman', width: '180px' },
              { key: 'assignedAt', header: 'Zimmet Tarihi', width: '140px', isNumeric: true },
              { key: 'status', header: 'Durum', width: '110px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'ACTIVE' ? 'success' : 'default'} /> },
              {
                key: 'action', header: 'Eylem', width: '120px', align: 'center',
                render: (row: any) => (
                  row.status === 'ACTIVE' ? (
                    <button onClick={() => handleReturnCustody(row.id)} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: 'none', backgroundColor: '#EF4444', color: '#FFFFFF', cursor: 'pointer' }}>İade Al</button>
                  ) : <span style={{ fontSize: '11px', color: '#64748B' }}>İade Edildi</span>
                )
              }
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 3: AST_TRANSFERS */}
      {activeSubTab === 'AST_TRANSFERS' && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Transfer no veya varlık ara..."
            primaryAction={{ label: '+ Yeni Transfer Talebi', onClick: () => setIsTransferModalOpen(true), icon: '+' }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={transfers}
            columns={[
              { key: 'trfNo', header: 'Transfer No', width: '150px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.trfNo}</strong> },
              { key: 'asset', header: 'Transfer Edilen Varlık', width: '240px' },
              { key: 'fromSpace', header: 'Çıkış Mekanı', width: '180px' },
              { key: 'toSpace', header: 'Hedef Mekan', width: '180px' },
              { key: 'requester', header: 'Talep Eden', width: '160px' },
              { key: 'status', header: 'Durum', width: '150px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'APPROVED' ? 'success' : 'warning'} /> },
              {
                key: 'action', header: 'Maker-Checker', width: '140px', align: 'center',
                render: (row: any) => (
                  row.status === 'PENDING_APPROVAL' ? (
                    <button onClick={() => handleApproveTransfer(row.id)} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: 'none', backgroundColor: '#10B981', color: '#FFFFFF', cursor: 'pointer' }}>✓ Onayla</button>
                  ) : <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>✓ Tamamlandı</span>
                )
              }
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 4: AST_SPACES */}
      {activeSubTab === 'AST_SPACES' && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Mekan kodu veya bina ara..."
            primaryAction={{ label: '+ Yeni Mekan / Derslik', onClick: () => setIsAddSpaceModalOpen(true), icon: '+' }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={spaces}
            columns={[
              { key: 'code', header: 'Mekan Kodu', width: '130px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.code}</strong> },
              { key: 'name', header: 'Mekan / Derslik Adı', width: '250px' },
              { key: 'building', header: 'Bina & Kat', width: '160px', render: (row: any) => <span>{row.building} - {row.floor}</span> },
              { key: 'type', header: 'Kullanım Türü', width: '140px' },
              { key: 'capacity', header: 'Kapasite', width: '100px', isNumeric: true },
              { key: 'area', header: 'Alan', width: '90px', isNumeric: true },
              { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
            ]}
          />
        </div>
      )}

      {/* Modals & Drawers */}
      <ModalDialog isOpen={isAddAssetModalOpen} onClose={() => setIsAddAssetModalOpen(false)} title="Yeni Demirbaş Varlık Kaydet" footer={<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => setIsAddAssetModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}>İptal</button><button onClick={handleAddAsset} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 600 }}>Kaydet</button></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Varlık Tanımı / Model</label><input type="text" value={newAssetForm.name} onChange={e => setNewAssetForm({ ...newAssetForm, name: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Fiziki Konum (Mekan)</label><input type="text" value={newAssetForm.space} onChange={e => setNewAssetForm({ ...newAssetForm, space: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Zimmet Sahibi</label><input type="text" value={newAssetForm.custodian} onChange={e => setNewAssetForm({ ...newAssetForm, custodian: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
        </div>
      </ModalDialog>

      <ModalDialog isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Varlık Transfer Talebi" footer={<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => setIsTransferModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}>İptal</button><button onClick={handleCreateTransfer} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 600 }}>Talebi Gönder</button></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Hedef Mekan</label><input type="text" value={newTransferForm.toSpace} onChange={e => setNewTransferForm({ ...newTransferForm, toSpace: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Talep Eden</label><input type="text" value={newTransferForm.requester} onChange={e => setNewTransferForm({ ...newTransferForm, requester: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
        </div>
      </ModalDialog>

      <ModalDialog isOpen={isAddSpaceModalOpen} onClose={() => setIsAddSpaceModalOpen(false)} title="Yeni Derslik / Mekan Ekle" footer={<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => setIsAddSpaceModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}>İptal</button><button onClick={handleAddSpace} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 600 }}>Mekanı Kaydet</button></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Mekan Kodu</label><input type="text" value={newSpaceForm.code} onChange={e => setNewSpaceForm({ ...newSpaceForm, code: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Mekan Adı</label><input type="text" value={newSpaceForm.name} onChange={e => setNewSpaceForm({ ...newSpaceForm, name: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
        </div>
      </ModalDialog>

      <SlideOverDrawer isOpen={Boolean(selectedAsset)} onClose={() => setSelectedAsset(null)} title={selectedAsset?.name || 'Demirbaş 360°'} subtitle={selectedAsset ? `Varlık No: ${selectedAsset.assetNumber}` : undefined}>
        {selectedAsset && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <p><strong>Mevcut Konum:</strong> {selectedAsset.space}</p>
              <p><strong>Zimmet Sahibi:</strong> {selectedAsset.custodian}</p>
              <p><strong>Garanti Bitiş:</strong> {selectedAsset.warranty}</p>
            </div>
            <button onClick={() => { setIsTransferModalOpen(true); setSelectedAsset(null); }} style={{ padding: '8px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 600, cursor: 'pointer' }}>Bu Varlığı Transfer Et</button>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
