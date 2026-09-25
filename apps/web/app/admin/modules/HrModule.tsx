'use client';

import React, { useState } from 'react';
import { ExcelTable, StatusBadge, KpiCard, FilterToolbar, SlideOverDrawer, ModalDialog, BILGEN_TOKENS } from '@bilgenos/ui';

export function HrModule({ activeSubTab }: { activeSubTab: string }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const [employees, setEmployees] = useState([
    { empNo: 'EMP-001', name: 'Ahmet Yılmaz', dept: 'Lise Fen Bölümü', pos: 'Matematik Öğretmeni', type: 'INDEFINITE', workPct: '%100', status: 'ACTIVE' },
    { empNo: 'EMP-002', name: 'Zeynep Ak', dept: 'Yabancı Diller', pos: 'İngilizce Zümre Bşk.', type: 'INDEFINITE', workPct: '%100', status: 'ACTIVE' },
    { empNo: 'EMP-003', name: 'Mehmet Demir', dept: 'İdari İşler', pos: 'Ulaşım & Servis Şoförü', type: 'FIXED_TERM', workPct: '%100', status: 'ACTIVE' },
    { empNo: 'EMP-004', name: 'Elif Şahin', dept: 'Rehberlik & Psikolojik Danışmanlık', pos: 'Rehber Öğretmen', type: 'INDEFINITE', workPct: '%100', status: 'ACTIVE' },
  ]);

  const [assignments, setAssignments] = useState([
    { id: 'asg-1', empNo: 'EMP-001', name: 'Ahmet Yılmaz', inst: 'Bilgen Koleji (Fen Lisesi)', dept: 'Fen Bilimleri', pos: 'Matematik Öğretmeni', pct: '%70', status: 'ACTIVE' },
    { id: 'asg-2', empNo: 'EMP-001', name: 'Ahmet Yılmaz', inst: 'Bilgen YKS Hazırlık Merkezi', dept: 'Sınav Grubu', pos: 'Geometri Danışmanı', pct: '%30', status: 'ACTIVE' },
    { id: 'asg-3', empNo: 'EMP-002', name: 'Zeynep Ak', inst: 'Bilgen Koleji (Anadolu)', dept: 'Yabancı Dil', pos: 'İngilizce Zümre Bşk.', pct: '%100', status: 'ACTIVE' },
  ]);

  const [leaves, setLeaves] = useState([
    { id: 'lev-1', name: 'Ahmet Yılmaz', type: 'Yıllık İzin', start: '2026-10-05', end: '2026-10-09', days: 5, status: 'PENDING' },
    { id: 'lev-2', name: 'Elif Şahin', type: 'Mazeret İzni', start: '2026-09-28', end: '2026-09-29', days: 2, status: 'APPROVED' },
  ]);

  const [attendance, setAttendance] = useState([
    { id: 'att-1', date: '2026-09-25', name: 'Ahmet Yılmaz', inTime: '07:45:10', outTime: '---', workHours: '6.5 Sa', status: 'ON_PREMISES' },
    { id: 'att-2', date: '2026-09-25', name: 'Zeynep Ak', inTime: '07:50:33', outTime: '---', workHours: '6.4 Sa', status: 'ON_PREMISES' },
    { id: 'att-3', date: '2026-09-25', name: 'Mehmet Demir', inTime: '06:30:15', outTime: '---', workHours: '7.8 Sa', status: 'ON_PREMISES' },
  ]);

  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({ name: 'Seda Korkmaz', dept: 'Sosyal Bilimler', pos: 'Tarih Öğretmeni', type: 'INDEFINITE' });
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

  const handleApproveLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'APPROVED' } : l));
    showNotice('İzin talebi onaylandı ve puantaja işlendi.');
  };

  const handleRejectLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'REJECTED' } : l));
    showNotice('İzin talebi reddedildi.');
  };

  const handleAddEmployee = () => {
    const newE = {
      empNo: `EMP-00${employees.length + 1}`,
      name: newEmpForm.name,
      dept: newEmpForm.dept,
      pos: newEmpForm.pos,
      type: newEmpForm.type,
      workPct: '%100',
      status: 'ACTIVE',
    };
    setEmployees(prev => [newE, ...prev]);
    setIsAddEmpModalOpen(false);
    showNotice(`${newE.name} personeli işe giriş kaydı yapıldı.`);
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
        <KpiCard title="Toplam Personel" value={`${employees.length + 138} Çalışan`} subtitle="124 Öğretmen, 18 İdari" badge={{ text: 'Doluluk: %98', variant: 'success' }} icon="👥" />
        <KpiCard title="Aktif Görevlendirme" value={`${assignments.length + 153} Kadro`} subtitle="Çoklu Kurum Dağılımı" badge={{ text: 'Kümülatif ≤ %100', variant: 'info' }} icon="📋" />
        <KpiCard title="İzin Talepleri" value={`${leaves.filter(l => l.status === 'PENDING').length} Bekleyen`} subtitle="Maker-Checker Onayında" badge={{ text: 'Yönetici Onayı', variant: 'warning' }} icon="🏖️" />
        <KpiCard title="Bugünkü Devam" value="%98.2" subtitle="Parmak İzi / Kartlı Giriş" badge={{ text: 'Puantaj Tam', variant: 'success' }} icon="⏱️" />
      </div>

      {/* SUB-TAB 1: HR_PERSONNEL */}
      {(activeSubTab === 'HR_PERSONNEL' || !activeSubTab) && (
        <div>
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Sicil no, ad soyad veya branş ara..."
            primaryAction={{ label: '+ Personel İşe Giriş', onClick: () => setIsAddEmpModalOpen(true), icon: '+' }}
          />
          <ExcelTable
            keyExtractor={(r: any) => r.empNo}
            data={employees.filter(e => !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.empNo.toLowerCase().includes(searchQuery.toLowerCase()))}
            columns={[
              { key: 'empNo', header: 'Sicil No', width: '130px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.empNo}</strong> },
              { key: 'name', header: 'Ad Soyad', width: '200px', render: (row: any) => <span onClick={() => setSelectedEmp(row)} style={{ fontWeight: 600, color: BILGEN_TOKENS.colors.accent, cursor: 'pointer', textDecoration: 'underline' }}>{row.name}</span> },
              { key: 'dept', header: 'Departman (İK-002)', width: '180px' },
              { key: 'pos', header: 'Pozisyon / Unvan', width: '200px' },
              { key: 'type', header: 'Sözleşme Türü', width: '150px' },
              { key: 'workPct', header: 'İstihdam %', width: '110px', isNumeric: true },
              { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
              {
                key: 'action', header: 'İncele', width: '110px', align: 'center',
                render: (row: any) => <button onClick={() => setSelectedEmp(row)} style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}>🔍 Özlük 360°</button>
              }
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 2: HR_ASSIGNMENTS */}
      {activeSubTab === 'HR_ASSIGNMENTS' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Personel veya kurum ara..." primaryAction={{ label: '+ Yeni Görevlendirme', onClick: () => alert('Yeni Görevlendirme Formu'), icon: '+' }} />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={assignments}
            columns={[
              { key: 'empNo', header: 'Sicil No', width: '130px', render: (row: any) => <strong style={{ fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>{row.empNo}</strong> },
              { key: 'name', header: 'Personel', width: '180px' },
              { key: 'inst', header: 'Görevlendirilen Kurum / Kampüs', width: '240px' },
              { key: 'dept', header: 'Departman', width: '160px' },
              { key: 'pos', header: 'Pozisyon', width: '180px' },
              { key: 'pct', header: 'Zaman Payı %', width: '120px', isNumeric: true },
              { key: 'status', header: 'Durum', width: '100px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 3: HR_LEAVES */}
      {activeSubTab === 'HR_LEAVES' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Personel veya izin türü ara..." primaryAction={{ label: '+ İzin Talep Et', onClick: () => alert('İzin Talep Formu'), icon: '+' }} />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={leaves}
            columns={[
              { key: 'name', header: 'Personel', width: '200px' },
              { key: 'type', header: 'İzin Türü', width: '150px' },
              { key: 'start', header: 'Başlangıç', width: '130px', isNumeric: true },
              { key: 'end', header: 'Bitiş', width: '130px', isNumeric: true },
              { key: 'days', header: 'Gün', width: '90px', isNumeric: true },
              { key: 'status', header: 'Onay Durumu', width: '140px', render: (row: any) => <StatusBadge label={row.status} variant={row.status === 'APPROVED' ? 'success' : (row.status === 'REJECTED' ? 'danger' : 'warning')} /> },
              {
                key: 'action', header: 'Maker-Checker Eylemi', width: '170px', align: 'center',
                render: (row: any) => (
                  row.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => handleApproveLeave(row.id)} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: 'none', backgroundColor: '#10B981', color: '#FFF', cursor: 'pointer' }}>✓ Onayla</button>
                      <button onClick={() => handleRejectLeave(row.id)} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: 'none', backgroundColor: '#EF4444', color: '#FFF', cursor: 'pointer' }}>✕ Reddet</button>
                    </div>
                  ) : <span style={{ fontSize: '11px', color: '#64748B' }}>İşlem Tamamlandı</span>
                )
              }
            ]}
          />
        </div>
      )}

      {/* SUB-TAB 4: HR_ATTENDANCE */}
      {activeSubTab === 'HR_ATTENDANCE' && (
        <div>
          <FilterToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Personel adı ara..." primaryAction={{ label: '+ Manuel Puantaj Ekle', onClick: () => alert('Manuel Puantaj'), icon: '+' }} />
          <ExcelTable
            keyExtractor={(r: any) => r.id}
            data={attendance}
            columns={[
              { key: 'date', header: 'Tarih', width: '130px', isNumeric: true },
              { key: 'name', header: 'Personel', width: '200px' },
              { key: 'inTime', header: 'Kartlı Giriş Saati', width: '160px', isNumeric: true },
              { key: 'outTime', header: 'Çıkış Saati', width: '140px', isNumeric: true },
              { key: 'workHours', header: 'Kümülatif Süre', width: '130px', isNumeric: true },
              { key: 'status', header: 'Mevcudiyet', width: '130px', render: (row: any) => <StatusBadge label={row.status} variant="success" /> },
            ]}
          />
        </div>
      )}

      {/* Add Employee Modal */}
      <ModalDialog isOpen={isAddEmpModalOpen} onClose={() => setIsAddEmpModalOpen(false)} title="Yeni Personel İşe Giriş Kaydı" footer={<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => setIsAddEmpModalOpen(false)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}>İptal</button><button onClick={handleAddEmployee} style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', backgroundColor: '#2563EB', color: '#FFF', fontWeight: 600 }}>Kaydet</button></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Ad Soyad</label><input type="text" value={newEmpForm.name} onChange={e => setNewEmpForm({ ...newEmpForm, name: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Departman</label><input type="text" value={newEmpForm.dept} onChange={e => setNewEmpForm({ ...newEmpForm, dept: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
          <div><label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '3px' }}>Pozisyon / Unvan</label><input type="text" value={newEmpForm.pos} onChange={e => setNewEmpForm({ ...newEmpForm, pos: e.target.value })} style={{ width: '100%', padding: '6px', border: '1px solid #CBD5E1', borderRadius: '4px' }} /></div>
        </div>
      </ModalDialog>

      <SlideOverDrawer isOpen={Boolean(selectedEmp)} onClose={() => setSelectedEmp(null)} title={selectedEmp?.name || 'Özlük 360°'} subtitle={selectedEmp ? `Sicil: ${selectedEmp.empNo}` : undefined}>
        {selectedEmp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <p><strong>Departman:</strong> {selectedEmp.dept}</p>
              <p><strong>Pozisyon:</strong> {selectedEmp.pos}</p>
              <p><strong>Sözleşme Türü:</strong> {selectedEmp.type}</p>
              <p><strong>İstihdam Oranı:</strong> {selectedEmp.workPct}</p>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
