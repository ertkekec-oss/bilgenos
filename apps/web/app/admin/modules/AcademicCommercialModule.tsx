'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, ModalDialog, BILGEN_TOKENS } from '@bilgenos/ui';

export function AcademicCommercialModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const [institutions, setInstitutions] = useState([
    { code: 'BILGEN-KOLEJ', name: 'Bilgen Fen ve Anadolu Lisesi', type: 'COLLEGE', capacity: '450 Öğrenci', activeEnr: '412', status: 'ACTIVE' },
    { code: 'BILGEN-YKS', name: 'Bilgen YKS Hazırlık Merkezi', type: 'EXAM_PREP_CENTER', capacity: '300 Öğrenci', activeEnr: '280', status: 'ACTIVE' },
    { code: 'BILGEN-DIL', name: 'Bilgen Yabancı Dil Akademisi', type: 'LANGUAGE_SCHOOL', capacity: '200 Öğrenci', activeEnr: '150', status: 'ACTIVE' },
  ]);

  const [admissions, setAdmissions] = useState([
    { id: 'adm-1', leadNo: 'CRM-2026-0084', student: 'Berk Can Vural', parent: 'Ali Vural', grade: '9. Sınıf (Fen Lisesi)', stage: 'INTERVIEW', counselor: 'Elif Şahin', date: '2026-09-24', status: 'ACTIVE' },
    { id: 'adm-2', leadNo: 'CRM-2026-0085', student: 'Ece Melis Ak', parent: 'Burak Ak', grade: '11. Sınıf (YKS Hazırlık)', stage: 'OFFER_SENT', counselor: 'Ahmet Yılmaz', date: '2026-09-25', status: 'ACTIVE' },
    { id: 'adm-3', leadNo: 'CRM-2026-0086', student: 'Defne Er', parent: 'Gül Er', grade: 'Hazırlık (Yabancı Dil)', stage: 'ENROLLED', counselor: 'Zeynep Ak', date: '2026-09-22', status: 'COMPLETED' },
  ]);

  const [contracts, setContracts] = useState([
    { id: 'cnt-1', contractNo: 'CNT-2026-0042', student: 'Kerem Bilgen', listPrice: '380,000 ₺', discount: '%15 (Kardeş Bursu)', netAmount: '323,000 ₺', signed: 'E-İmza Tamam', status: 'ACTIVE' },
    { id: 'cnt-2', contractNo: 'CNT-2026-0089', student: 'Zeynep Kaya', listPrice: '380,000 ₺', discount: '%0 (Standart)', netAmount: '380,000 ₺', signed: 'E-İmza Tamam', status: 'ACTIVE' },
  ]);

  const [paymentPlans, setPaymentPlans] = useState([
    { id: 'pay-1', contractNo: 'CNT-2026-0042', instNo: 'Taksit 1/10', dueDate: '2026-10-15', amount: '32,300 ₺', status: 'PAID' },
    { id: 'pay-2', contractNo: 'CNT-2026-0042', instNo: 'Taksit 2/10', dueDate: '2026-11-15', amount: '32,300 ₺', status: 'PENDING' },
    { id: 'pay-3', contractNo: 'CNT-2026-0089', instNo: 'Taksit 1/10', dueDate: '2026-10-15', amount: '38,000 ₺', status: 'PENDING' },
  ]);

  const [capabilities, setCapabilities] = useState([
    { key: 'CAP_COMMERCIAL_BILLING', name: 'Otomatik E-Fatura & E-Arşiv Kesimi', status: 'ACTIVE' },
    { key: 'CAP_STUDENT_TRANSPORT', name: 'Canlı Öğrenci Servis & Güzergah Takibi', status: 'ACTIVE' },
    { key: 'CAP_CANTEEN_WALLET', name: 'Akıllı Kart & Kantin Bakiyesi', status: 'INACTIVE' },
    { key: 'CAP_SMS_GATEWAY', name: 'Otomatik SMS Veli Bildirim Kapısı', status: 'ACTIVE' },
  ]);

  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({ student: 'Mina Doğan', parent: 'Kaan Doğan', grade: '9. Sınıf', counselor: 'Elif Şahin' });

  const handlePayInstallment = (id: string) => {
    setPaymentPlans(prev => prev.map(p => p.id === id ? { ...p, status: 'PAID' } : p));
    showNotice('Taksit tahsilatı onaylandı ve tahsilat makbuzu oluşturuldu.');
  };

  const handleAdvanceStage = (id: string) => {
    setAdmissions(prev => prev.map(a => a.id === id ? { ...a, stage: a.stage === 'INTERVIEW' ? 'OFFER_SENT' : 'ENROLLED' } : a));
    showNotice('Aday kayıt aşaması bir sonraki adıma ilerletildi.');
  };

  const handleToggleCapability = (key: string) => {
    setCapabilities(prev => prev.map(c => c.key === key ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : c));
    showNotice('Kurumsal yetenek durumu güncellendi.');
  };

  const handleCreateLead = () => {
    const newL = {
      id: `adm-${Date.now()}`,
      leadNo: `CRM-2026-00${admissions.length + 1}`,
      student: newLeadForm.student,
      parent: newLeadForm.parent,
      grade: newLeadForm.grade,
      stage: 'INTERVIEW',
      counselor: newLeadForm.counselor,
      date: '2026-09-25',
      status: 'ACTIVE',
    };
    setAdmissions(prev => [newL, ...prev]);
    setIsAddLeadModalOpen(false);
    showNotice(`${newL.student} aday havuzuna kaydedildi.`);
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
        <KpiCard title="Kayıtlı Öğrenciler" value="842 Öğrenci" subtitle="3 Kurum / 5 Kampüs" badge={{ text: 'Doluluk: %94', variant: 'success' }} icon="🎓" />
        <KpiCard title="Aday Havuzu (CRM)" value={`${admissions.filter(a => a.status === 'ACTIVE').length + 125} Aday`} subtitle="Görüşme ve Teklifte" badge={{ text: 'Dönüşüm: %32', variant: 'warning' }} icon="📝" />
        <KpiCard title="Sözleşme Hacmi" value="48.5M ₺" subtitle="2026-2027 Dönemi" badge={{ text: 'Taahhüt Alındı', variant: 'info' }} icon="📜" />
        <KpiCard title="Ödeme Planı Tahsilatı" value="%76.4" subtitle="Gününde Ödenen Taksit" badge={{ text: 'Düzenli', variant: 'success' }} icon="💳" />
      </div>

      {/* SUB-TAB 1: ACA_INSTITUTIONS */}
      {(activeSubTab === 'ACA_INSTITUTIONS' || !activeSubTab) && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Kurum adı veya kodu ara..." primaryAction={{ label: '+ Yeni Kurum Ekle', onClick: () => alert('Yeni Kurum Formu'), icon: '+' }} />
          <ExcelTable
            keyExtractor={(r: any) => r.code}
            data={institutions}
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
      )}

      {/* SUB-TAB 2: ACA_ADMISSIONS */}
      {activeSubTab === 'ACA_ADMISSIONS' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Aday no, öğrenci veya veli ara..." primaryAction={{ label: '+ Yeni Aday Kaydet', onClick: () => setIsAddLeadModalOpen(true), icon: '+' }} />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={admissions}
            columns={[
              { key: 'leadNo', header: 'Aday No', width: '150px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.leadNo}</strong> },
              { key: 'student', header: 'Aday Öğrenci', width: '180px' },
              { key: 'parent', header: 'Veli Adı', width: '180px' },
              { key: 'grade', header: 'Hedef Sınıf / Program', width: '200px' },
              { key: 'stage', header: 'Görüşme Aşaması', width: '150px', render: (row: any) => <StatusBadge label={row.stage} variant={row.stage === 'ENROLLED' ? 'success' : 'info'} /> },
              { key: 'counselor', header: 'Danışman', width: '160px' },
              {
                key: 'action', header: 'Aşama İlerlet', width: '150px', align: 'center',
                render: (row: any) => (
                  row.stage !== 'ENROLLED' ? (
                    <button onClick={() => handleAdvanceStage(row.id)} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', cursor: 'pointer' }}>▶ İlerlet</button>
                  ) : <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>✓ Kayıt Tamam</span>
                )
              }
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 3: ACA_COMMERCIAL */}
      {activeSubTab === 'ACA_COMMERCIAL' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Sözleşme no veya öğrenci ara..." primaryAction={{ label: '+ Yeni Sözleşme Hazırla', onClick: () => alert('Sözleşme Sihirbazı'), icon: '+' }} />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={contracts}
            columns={[
              { key: 'contractNo', header: 'Sözleşme No', width: '160px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.contractNo}</strong> },
              { key: 'student', header: 'Öğrenci', width: '180px' },
              { key: 'listPrice', header: 'Liste Fiyatı', width: '140px', isNumeric: true },
              { key: 'discount', header: 'Uygulanan Burs / İndirim', width: '190px' },
              { key: 'netAmount', header: 'Net Sözleşme Tutarı', width: '170px', isNumeric: true, render: (row: any) => <strong>{row.netAmount}</strong> },
              { key: 'signed', header: 'Veli İmzası', width: '150px', render: (row: any) => <StatusBadge label={row.signed} variant="success" /> },
              { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 4: ACA_PAYMENT_PLANS */}
      {activeSubTab === 'ACA_PAYMENT_PLANS' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Sözleşme veya taksit ara..." />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={paymentPlans}
            columns={[
              { key: 'contractNo', header: 'Sözleşme No', width: '160px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.contractNo}</strong> },
              { key: 'instNo', header: 'Taksit Sırası', width: '130px' },
              { key: 'dueDate', header: 'Vade Tarihi', width: '140px', isNumeric: true },
              { key: 'amount', header: 'Taksit Tutarı', width: '150px', isNumeric: true, render: (row: any) => <strong>{row.amount}</strong> },
              { key: 'status', header: 'Durum', width: '120px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'PAID' ? 'success' : 'warning'} /> },
              {
                key: 'action', header: 'Eylem', width: '130px', align: 'center',
                render: (row: any) => (
                  row.status === 'PENDING' ? (
                    <button onClick={() => handlePayInstallment(row.id)} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: 'none', backgroundColor: '#10B981', color: '#FFF', cursor: 'pointer' }}>💳 Tahsil Et</button>
                  ) : <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>✓ Ödendi</span>
                )
              }
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 5: ACA_CAPABILITIES */}
      {activeSubTab === 'ACA_CAPABILITIES' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Yetenek ara..." />
          <ExcelTable
            keyExtractor={(r: any) => r.key}
            data={capabilities}
            columns={[
              { key: 'key', header: 'Yetenek Kodu', width: '240px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.key}</strong> },
              { key: 'name', header: 'Modül / Yetenek Açıklaması', width: '380px' },
              { key: 'status', header: 'Mevcut Durum', width: '130px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'ACTIVE' ? 'success' : 'default'} /> },
              {
                key: 'action', header: 'Aç / Kapat', width: '140px', align: 'center',
                render: (row: any) => (
                  <button onClick={() => handleToggleCapability(row.key)} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer' }}>
                    {row.status === 'ACTIVE' ? 'Kapat' : 'Aktifleştir'}
                  </button>
                )
              }
            ]}
          />
        </div>
      )}

      {/* Modal: Yeni Aday */}
      <ModalDialog isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} title="Yeni Aday Öğrenci Kaydet" footer={<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => setIsAddLeadModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}>İptal</button><button onClick={handleCreateLead} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 600 }}>Kaydet</button></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Aday Öğrenci Adı</label><input type="text" value={newLeadForm.student} onChange={e => setNewLeadForm({ ...newLeadForm, student: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Veli Adı Soyadı</label><input type="text" value={newLeadForm.parent} onChange={e => setNewLeadForm({ ...newLeadForm, parent: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Hedef Sınıf</label><input type="text" value={newLeadForm.grade} onChange={e => setNewLeadForm({ ...newLeadForm, grade: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
        </div>
      </ModalDialog>
    </div>
  );
}
