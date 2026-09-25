'use client';

import React from 'react';
import { BILGEN_TOKENS } from '@bilgenos/ui';

interface AppHeaderProps {
  currentModuleTitle: string;
  currentSubTabTitle: string;
}

export function AppHeader({
  currentModuleTitle,
  currentSubTabTitle,
}: AppHeaderProps): React.ReactElement {
  return (
    <header
      style={{
        height: '48px',
        backgroundColor: '#FFFFFF',
        borderBottom: `1px solid ${BILGEN_TOKENS.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: BILGEN_TOKENS.shadows.sm,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
        <span style={{ color: BILGEN_TOKENS.colors.textMuted, fontWeight: 500 }}>
          {currentModuleTitle}
        </span>
        <span style={{ color: BILGEN_TOKENS.colors.borderStrong }}>/</span>
        <span style={{ color: BILGEN_TOKENS.colors.textPrimary, fontWeight: 700 }}>
          {currentSubTabTitle}
        </span>
      </div>

      {/* Right Controls - Kurumsal Yönetici Çubuğu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Aktif Kampüs Seçici */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '5px',
            backgroundColor: '#F8FAFC',
            border: `1px solid ${BILGEN_TOKENS.colors.border}`,
            fontSize: '12px',
            fontWeight: 600,
            color: BILGEN_TOKENS.colors.textPrimary,
            cursor: 'pointer',
          }}
        >
          <span>🏫</span>
          <span>Bilgen Koleji (Merkez Kampüs)</span>
          <span style={{ fontSize: '9px', color: '#94A3B8' }}>▼</span>
        </div>

        {/* Dönem Bilgisi */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '5px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#1D4ED8',
          }}
        >
          <span>📅</span>
          <span>2026 - 2027 Eğitim Dönemi</span>
        </div>

        {/* Bildirim Zili */}
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            backgroundColor: '#F8FAFC',
            border: `1px solid ${BILGEN_TOKENS.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="3 bekleyen operasyonel bildirim"
        >
          <span style={{ fontSize: '14px' }}>🔔</span>
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '9px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            3
          </span>
        </div>

        {/* Kullanıcı Profili */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            paddingLeft: '14px',
            borderLeft: `1px solid ${BILGEN_TOKENS.colors.border}`,
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            KB
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: BILGEN_TOKENS.colors.textPrimary, lineHeight: 1.1 }}>
              Kerem Bilgen
            </div>
            <div style={{ fontSize: '10.5px', color: BILGEN_TOKENS.colors.textMuted, lineHeight: 1.1, marginTop: '2px' }}>
              Genel Müdür (Süper Admin)
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
