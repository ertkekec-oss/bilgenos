'use client';

import React from 'react';
import { BILGEN_TOKENS } from '@bilgenos/ui';

export type MainModuleId =
  | 'ACADEMIC_CRM'
  | 'FINANCE'
  | 'HR'
  | 'CAMPUS_ASSET'
  | 'TRANSPORTATION'
  | 'SECURITY';

interface AppSidebarProps {
  activeModule: MainModuleId;
  onSelectModule: (id: MainModuleId) => void;
  activeSubTab: string;
  onSelectSubTab: (tabId: string) => void;
}

interface NavGroup {
  id: MainModuleId;
  title: string;
  icon: string;
  badge?: string;
  items: Array<{ id: string; label: string }>;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'TRANSPORTATION',
    title: 'Ulaşım & Servis',
    icon: '🚌',
    badge: 'CANLI',
    items: [
      { id: 'TRN_TRIPS', label: 'Canlı Sefer & Teslimat' },
      { id: 'TRN_ROUTES', label: 'Güzergahlar & Duraklar' },
      { id: 'TRN_FLEET', label: 'Araç Filosu & Sürücüler' },
      { id: 'TRN_PASSENGERS', label: 'Yolcu Listesi & Zimmet' },
    ],
  },
  {
    id: 'CAMPUS_ASSET',
    title: 'Yerleşke & Varlık',
    icon: '🏢',
    items: [
      { id: 'AST_INVENTORY', label: 'Demirbaş & Varlıklar' },
      { id: 'AST_CUSTODY', label: 'Zimmet & Sorumluluk' },
      { id: 'AST_TRANSFERS', label: 'Varlık Transferleri' },
      { id: 'AST_SPACES', label: 'Binalar & Mekanlar' },
    ],
  },
  {
    id: 'HR',
    title: 'İnsan Kaynakları',
    icon: '👥',
    items: [
      { id: 'HR_PERSONNEL', label: 'Personel & Özlük' },
      { id: 'HR_ASSIGNMENTS', label: 'Görevlendirmeler' },
      { id: 'HR_LEAVES', label: 'İzin & Mazeret' },
      { id: 'HR_ATTENDANCE', label: 'Devam & Puantaj' },
    ],
  },
  {
    id: 'FINANCE',
    title: 'Finans & Gelir',
    icon: '💼',
    items: [
      { id: 'FIN_ACCOUNTS', label: 'Kasa & Banka' },
      { id: 'FIN_COLLECTIONS', label: 'Tahsilat & Mahsup' },
      { id: 'FIN_LEDGER', label: 'Operasyonel Defter' },
      { id: 'FIN_RECONCILIATION', label: 'Finansal Mutabakat' },
    ],
  },
  {
    id: 'ACADEMIC_CRM',
    title: 'Akademik & Kayıt (CRM)',
    icon: '🎓',
    items: [
      { id: 'ACA_INSTITUTIONS', label: 'Kurum & Kampüsler' },
      { id: 'ACA_ADMISSIONS', label: 'Aday & Başvuru (CRM)' },
      { id: 'ACA_COMMERCIAL', label: 'Sözleşme & Kayıt' },
      { id: 'ACA_PAYMENT_PLANS', label: 'Ödeme Planları' },
      { id: 'ACA_CAPABILITIES', label: 'Yetenek Matrisi' },
    ],
  },
  {
    id: 'SECURITY',
    title: 'Güvenlik & Sistem',
    icon: '🛡️',
    items: [
      { id: 'SEC_AUDIT', label: 'Denetim İzi (Audit)' },
      { id: 'SEC_INTEGRATION', label: 'BilgenOkul Hub' },
    ],
  },
];

export function AppSidebar({
  activeModule,
  onSelectModule,
  activeSubTab,
  onSelectSubTab,
}: AppSidebarProps): React.ReactElement {
  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: BILGEN_TOKENS.colors.sidebarBg,
        color: BILGEN_TOKENS.colors.sidebarText,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${BILGEN_TOKENS.colors.sidebarBorder}`,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${BILGEN_TOKENS.colors.sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: BILGEN_TOKENS.colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '15px',
          }}
        >
          B
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.05em', color: '#FFFFFF' }}>
            BİLGEN OS
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, letterSpacing: '0.08em' }}>
            ENTERPRISE ERP
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {NAV_GROUPS.map((group) => {
          const isGroupActive = activeModule === group.id;

          return (
            <div key={group.id} style={{ marginBottom: '14px' }}>
              {/* Group Trigger */}
              <div
                onClick={() => {
                  onSelectModule(group.id);
                  if (group.items[0]) {
                    onSelectSubTab(group.items[0].id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: BILGEN_TOKENS.dimensions.radiusSm,
                  cursor: 'pointer',
                  backgroundColor: isGroupActive ? BILGEN_TOKENS.colors.sidebarCard : 'transparent',
                  color: isGroupActive ? '#FFFFFF' : BILGEN_TOKENS.colors.sidebarText,
                  fontWeight: isGroupActive ? 700 : 600,
                  fontSize: '12px',
                  transition: 'background-color 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{group.icon}</span>
                  <span>{group.title}</span>
                </div>
                {group.badge && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 5px',
                      borderRadius: '3px',
                      backgroundColor: BILGEN_TOKENS.colors.success,
                      color: '#FFFFFF',
                    }}
                  >
                    {group.badge}
                  </span>
                )}
              </div>

              {/* Sub-items (expanded when active) */}
              {isGroupActive && (
                <div style={{ marginTop: '3px', marginLeft: '12px', paddingLeft: '10px', borderLeft: '1px solid #334155' }}>
                  {group.items.map((item) => {
                    const isSubActive = activeSubTab === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectSubTab(item.id)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '11.5px',
                          fontWeight: isSubActive ? 600 : 500,
                          color: isSubActive ? '#FFFFFF' : '#94A3B8',
                          backgroundColor: isSubActive ? '#2563EB' : 'transparent',
                          borderRadius: BILGEN_TOKENS.dimensions.radiusSm,
                          cursor: 'pointer',
                          marginTop: '2px',
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Tenant Info */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${BILGEN_TOKENS.colors.sidebarBorder}`,
          backgroundColor: '#0B0F19',
        }}
      >
        <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
          Aktif Organizasyon
        </div>
        <div style={{ fontSize: '11px', color: '#E2E8F0', fontWeight: 600, marginTop: '2px' }}>
          Bilgen Eğitim Kurumları
        </div>
        <div style={{ fontSize: '10px', color: '#38BDF8', marginTop: '2px', fontFamily: BILGEN_TOKENS.typography.fontFamilyMono }}>
          TENANT-BILGEN-HOLDING
        </div>
      </div>
    </aside>
  );
}
