import React from 'react';
import { BILGEN_TOKENS } from '../theme/tokens.js';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  icon?: string;
}

export function KpiCard({ title, value, subtitle, badge, icon }: KpiCardProps): React.ReactElement {
  const getBadgeColors = (variant?: string) => {
    switch (variant) {
      case 'success': return { bg: BILGEN_TOKENS.colors.successLight, text: BILGEN_TOKENS.colors.success, border: BILGEN_TOKENS.colors.successBorder };
      case 'warning': return { bg: BILGEN_TOKENS.colors.warningLight, text: BILGEN_TOKENS.colors.warning, border: BILGEN_TOKENS.colors.warningBorder };
      case 'danger': return { bg: BILGEN_TOKENS.colors.dangerLight, text: BILGEN_TOKENS.colors.danger, border: BILGEN_TOKENS.colors.dangerBorder };
      case 'info': return { bg: BILGEN_TOKENS.colors.infoLight, text: BILGEN_TOKENS.colors.info, border: BILGEN_TOKENS.colors.infoBorder };
      default: return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  const badgeColors = getBadgeColors(badge?.variant);

  return (
    <div
      style={{
        backgroundColor: BILGEN_TOKENS.colors.surface,
        border: `1px solid ${BILGEN_TOKENS.colors.border}`,
        borderRadius: BILGEN_TOKENS.dimensions.radiusMd,
        padding: '12px 16px',
        boxShadow: BILGEN_TOKENS.shadows.sm,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
        minWidth: '200px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: BILGEN_TOKENS.colors.textSecondary }}>
          {title}
        </span>
        {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontFamily: BILGEN_TOKENS.typography.fontFamilyMono,
            fontSize: '22px',
            fontWeight: 700,
            color: BILGEN_TOKENS.colors.textPrimary,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {badge && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: badgeColors.bg,
              color: badgeColors.text,
              border: `1px solid ${badgeColors.border}`,
            }}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '11px', color: BILGEN_TOKENS.colors.textMuted, marginTop: '4px' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
