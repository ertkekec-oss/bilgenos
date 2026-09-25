'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, ModalDialog, BILGEN_TOKENS } from '@bilgenos/ui';

export function FinanceModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const [accounts, setAccounts] = useState([
    { id: 'fa-1', code: 'KASA-01', name: 'Merkez Kampüs Nakit Kasa', type: 'CASH', currency: 'TRY', balance: '185,420.00 ₺', status: 'ACTIVE' },
    { id: 'fa-2', code: 'BNK-GARANTI', name: 'Garanti BBVA Ticari Ana Hesap', type: 'BANK', currency: 'TRY', balance: '4,892,110.50 ₺', status: 'ACTIVE' },
    { id: 'fa-3', code: 'BNK-AKBANK', name: 'Akbank Sanal POS Tahsilat Hesabı', type: 'POS', currency: 'TRY', balance: '1,240,650.00 ₺', status: 'ACTIVE' },
  ]);

  const [collections, setCollections] = useState([
    { id: 'col-1', receiptNo: 'RCP-2026-0041', payer: 'Fatma Bilgen', student: 'Kerem Bilgen', amount: '45,000.00 ₺', method: 'Kredi Kartı (Tek Çekim)', account: 'Akbank POS', date: '2026-09-24', status: 'CONFIRMED' },
    { id: 'col-2', receiptNo: 'RCP-2026-0042', payer: 'Murat Kaya', student: 'Zeynep Kaya', amount: '22,500.00 ₺', method: 'Banka Havalesi / EFT', account: 'Garanti BBVA', date: '2026-09-25', status: 'CONFIRMED' },
    { id: 'col-3', receiptNo: 'RCP-2026-0043', payer: 'Selin Özdemir', student: 'Caner Özdemir', amount: '18,000.00 ₺', method: 'Nakit Tahsilat', account: 'Merkez Kasa', date: '2026-09-25', status: 'PENDING' },
  ]);

  const [ledger, setLedger] = useState([
    { id: 'led-1', jrnNo: 'JRN-2026-0104', date: '2026-09-24', desc: 'Öğrenci Eğitim Ücreti Tahsilatı (Kerem Bilgen)', debit: '45,000.00 ₺', credit: '0.00 ₺', balance: '45,000.00 ₺' },
    { id: 'led-2', jrnNo: 'JRN-2026-0105', date: '2026-09-25', desc: 'Servis Taşıma Taşeron Ödemesi (Özlem Turizm)', debit: '0.00 ₺', credit: '18,500.00 ₺', balance: '26,500.00 ₺' },
  ]);

  const [reconciliations, setReconciliations] = useState([
    { id: 'rec-1', sessionCode: 'REC-20260924-EOD', date: '2026-09-24', account: 'Akbank Sanal POS', sysBal: '1,240,650.00 ₺', bankBal: '1,240,650.00 ₺', diff: '0.00 ₺', status: 'RECONCILED' },
    { id: 'rec-2', sessionCode: 'REC-20260925-EOD', date: '2026-09-25', account: 'Garanti BBVA', sysBal: '4,892,110.50 ₺', bankBal: '4,892,110.50 ₺', diff: '0.00 ₺', status: 'PENDING' },
  ]);

  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [newColForm, setNewColForm] = useState({ payer: 'Ali Vural', student: 'Mert Vural', amount: '35,000.00 ₺', method: 'Kredi Kartı', account: 'Akbank POS' });

  const handleApproveReconciliation = (id: string) => {
    setReconciliations(prev => prev.map(r => r.id === id ? { ...r, status: 'RECONCILED' } : r));
    showNotice('Banka ve sistem mutabakatı onaylandı. Fark: 0.00 ₺.');
  };

  const handleCreateCollection = () => {
    const newCol = {
      id: `col-${Date.now()}`,
      receiptNo: `RCP-2026-00${collections.length + 1}`,
      payer: newColForm.payer,
      student: newColForm.student,
      amount: newColForm.amount,
      method: newColForm.method,
      account: newColForm.account,
      date: '2026-09-25',
      status: 'CONFIRMED',
    };
    setCollections(prev => [newCol, ...prev]);
    setIsAddCollectionModalOpen(false);
    showNotice(`${newCol.receiptNo} nolu tahsilat makbuzu düzenlendi ve deftere işlendi.`);
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
        <KpiCard title="Toplam Likit Varlık" value="6.31M ₺" subtitle="Kasa ve Banka Mevcudu" badge={{ text: '3 Aktif Hesap', variant: 'success' }} icon="💰" />
        <KpiCard title="Bugünkü Tahsilat Hacmi" value="85,500 ₺" subtitle="Kredi Kartı ve Havale" badge={{ text: '3 İşlem', variant: 'info' }} icon="💳" />
        <KpiCard title="Vadesi Gelen Alacak" value="340,000 ₺" subtitle="Bu Hafta Beklenen Taksit" badge={{ text: '12 Sözleşme', variant: 'warning' }} icon="📅" />
        <KpiCard title="Gün Sonu Mutabakatı" value="FARK: 0.00 ₺" subtitle="Kuruşu Kuruşuna Eşleşti" badge={{ text: 'Tam Mutabakat', variant: 'success' }} icon="⚖️" />
      </div>

      {/* SUB-TAB 1: FIN_ACCOUNTS */}
      {(activeSubTab === 'FIN_ACCOUNTS' || !activeSubTab) && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Hesap adı veya kodu ara..." primaryAction={{ label: '+ Yeni Kasa / Hesap', onClick: () => alert('Yeni Hesap Ekleme Formu'), icon: '+' }} />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={accounts}
            columns={[
              { key: 'code', header: 'Hesap Kodu', width: '150px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.code}</strong> },
              { key: 'name', header: 'Hesap Tanımı', width: '280px' },
              { key: 'type', header: 'Hesap Türü', width: '130px' },
              { key: 'currency', header: 'Döviz', width: '90px' },
              { key: 'balance', header: 'Güncel Bakiye', width: '170px', isNumeric: true, render: (row: any) => <strong style={{ color: '#047857' }}>{row.balance}</strong> },
              { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 2: FIN_COLLECTIONS */}
      {activeSubTab === 'FIN_COLLECTIONS' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Makbuz no, veli veya öğrenci ara..." primaryAction={{ label: '+ Yeni Tahsilat Al', onClick: () => setIsAddCollectionModalOpen(true), icon: '+' }} />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={collections}
            columns={[
              { key: 'receiptNo', header: 'Makbuz No', width: '150px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.receiptNo}</strong> },
              { key: 'payer', header: 'Ödeyen Veli', width: '180px' },
              { key: 'student', header: 'Öğrenci', width: '170px' },
              { key: 'amount', header: 'Tahsil Edilen Tutar', width: '160px', isNumeric: true, render: (row: any) => <strong>{row.amount}</strong> },
              { key: 'method', header: 'Ödeme Şekli', width: '180px' },
              { key: 'account', header: 'Giriş Hesabı', width: '150px' },
              { key: 'date', header: 'İşlem Tarihi', width: '130px', isNumeric: true },
              { key: 'status', header: 'Durum', width: '120px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 3: FIN_LEDGER */}
      {activeSubTab === 'FIN_LEDGER' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Yevmiye fiş no veya açıklama ara..." />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={ledger}
            columns={[
              { key: 'jrnNo', header: 'Yevmiye No', width: '150px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.jrnNo}</strong> },
              { key: 'date', header: 'Kayıt Tarihi', width: '130px', isNumeric: true },
              { key: 'desc', header: 'Operasyonel Açıklama', width: '360px' },
              { key: 'debit', header: 'Borç Tutarı (TL)', width: '150px', isNumeric: true },
              { key: 'credit', header: 'Alacak Tutarı (TL)', width: '150px', isNumeric: true },
              { key: 'balance', header: 'Kalan Bakiye', width: '150px', isNumeric: true, render: (row: any) => <strong>{row.balance}</strong> },
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 4: FIN_RECONCILIATION */}
      {activeSubTab === 'FIN_RECONCILIATION' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Oturum no veya hesap ara..." />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={reconciliations}
            columns={[
              { key: 'sessionCode', header: 'Oturum Kodu', width: '180px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.sessionCode}</strong> },
              { key: 'date', header: 'Mutabakat Tarihi', width: '140px', isNumeric: true },
              { key: 'account', header: 'Hesap Tanımı', width: '220px' },
              { key: 'sysBal', header: 'Sistem Bakiyesi', width: '160px', isNumeric: true },
              { key: 'bankBal', header: 'Banka Ekstresi', width: '160px', isNumeric: true },
              { key: 'diff', header: 'Fark', width: '110px', isNumeric: true, render: (row: any) => <span style={{ color: '#047857', fontWeight: 700 }}>{row.diff}</span> },
              { key: 'status', header: 'Durum', width: '130px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'RECONCILED' ? 'success' : 'warning'} /> },
              {
                key: 'action', header: 'Eylem', width: '130px', align: 'center',
                render: (row: any) => (
                  row.status === 'PENDING' ? (
                    <button onClick={() => handleApproveReconciliation(row.id)} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: 'none', backgroundColor: '#10B981', color: '#FFF', cursor: 'pointer' }}>✓ Onayla</button>
                  ) : <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>✓ Eşleşti</span>
                )
              }
            ]}
          />
        </div>
      )}

      {/* Modal: Yeni Tahsilat */}
      <ModalDialog isOpen={isAddCollectionModalOpen} onClose={() => setIsAddCollectionModalOpen(false)} title="Yeni Tahsilat Makbuzu Kes" footer={<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => setIsAddCollectionModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}>İptal</button><button onClick={handleCreateCollection} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 600 }}>Tahsilatı Kaydet</button></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Ödeyen Veli</label><input type="text" value={newColForm.payer} onChange={e => setNewColForm({ ...newColForm, payer: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Öğrenci</label><input type="text" value={newColForm.student} onChange={e => setNewColForm({ ...newColForm, student: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Tahsil Edilen Tutar</label><input type="text" value={newColForm.amount} onChange={e => setNewColForm({ ...newColForm, amount: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
        </div>
      </ModalDialog>
    </div>
  );
}
