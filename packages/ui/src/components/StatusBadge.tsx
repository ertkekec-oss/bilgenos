import React from 'react';
import { BILGEN_TOKENS } from '../theme/tokens.js';

export type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
}

export function StatusBadge({ label, variant = 'default' }: StatusBadgeProps): React.ReactElement {
  let bg = '#F1F3F5';
  let border = '#D9DDE3';
  let text = '#20242A';

  switch (variant) {
    case 'success':
      bg = '#EBFBEE';
      border = '#B2F2BB';
      text = '#2B8A3E';
      break;
    case 'warning':
      bg = '#FFF9DB';
      border = '#FFE066';
      text = '#D9730D';
      break;
    case 'danger':
      bg = '#FFF5F5';
      border = '#FFC9C9';
      text = '#C92A2A';
      break;
    case 'info':
      bg = '#E7F5FF';
      border = '#A5D8FF';
      text = '#0F4C81';
      break;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderRadius: BILGEN_TOKENS.dimensions.radius,
        border: `1px solid ${border}`,
        backgroundColor: bg,
        color: text,
        fontFamily: BILGEN_TOKENS.typography.fontFamilyMono,
      }}
    >
      {label}
    </span>
  );
}
