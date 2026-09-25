'use client';

import React from 'react';
import { BILGEN_TOKENS } from '@bilgenos/ui';

interface AppHeaderProps {
  currentModuleTitle: string;
  currentSubTabTitle: string;
  onQuickAction?: () => void;
}

export function AppHeader({
  currentModuleTitle,
  currentSubTabTitle,
}: AppHeaderProps): React.ReactElement {
  return (
    <header
      style={{
        height: '46px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <span style={{ color: BILGEN_TOKENS.colors.textMuted, fontWeight: 500 }}>
          {currentModuleTitle}
        </span>
        <span style={{ color: BILGEN_TOKENS.colors.borderStrong }}>/</span>
        <span style={{ color: BILGEN_TOKENS.colors.textPrimary, fontWeight: 700 }}>
          {currentSubTabTitle}
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Security Shield Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: BILGEN_TOKENS.colors.successLight,
            border: `1px solid ${BILGEN_TOKENS.colors.successBorder}`,
            fontSize: '11px',
            fontWeight: 700,
            color: BILGEN_TOKENS.colors.success,
          }}
        >
          <span>🛡️</span>
          <span>DEFENSE-IN-DEPTH: ACTIVE</span>
        </div>

        {/* Database Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            color: BILGEN_TOKENS.colors.textSecondary,
            fontFamily: BILGEN_TOKENS.typography.fontFamilyMono,
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span>Neon PostgreSQL</span>
        </div>

        {/* User Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '12px',
            borderLeft: `1px solid ${BILGEN_TOKENS.colors.border}`,
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              color: '#475569',
            }}
          >
            KB
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: BILGEN_TOKENS.colors.textPrimary }}>
            Kerem Bilgen (Admin)
          </span>
        </div>
      </div>
    </header>
  );
}
