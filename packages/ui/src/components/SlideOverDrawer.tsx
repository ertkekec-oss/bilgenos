import React from 'react';
import { BILGEN_TOKENS } from '../theme/tokens.js';

export interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  width?: string;
}

export function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footerActions,
  width = '480px',
}: SlideOverDrawerProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width,
          maxWidth: '90vw',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: BILGEN_TOKENS.shadows.drawer,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `1px solid ${BILGEN_TOKENS.colors.border}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${BILGEN_TOKENS.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: BILGEN_TOKENS.colors.surfaceSubtle,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: BILGEN_TOKENS.colors.textPrimary }}>
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${BILGEN_TOKENS.colors.border}`,
              borderRadius: BILGEN_TOKENS.dimensions.radiusSm,
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              color: BILGEN_TOKENS.colors.textSecondary,
            }}
          >
            ✕ Kapat
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>

        {/* Footer Actions */}
        {footerActions && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: `1px solid ${BILGEN_TOKENS.colors.border}`,
              backgroundColor: BILGEN_TOKENS.colors.surfaceSubtle,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
}
