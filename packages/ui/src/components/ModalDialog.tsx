import React from 'react';
import { BILGEN_TOKENS } from '../theme/tokens.js';

export interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  footer?: React.ReactNode;
}

export function ModalDialog({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  children,
  onConfirm,
  confirmText = 'Onayla',
  confirmVariant = 'primary',
  footer,
}: ModalDialogProps): React.ReactElement | null {
  if (!isOpen) return null;

  const getConfirmBg = () => {
    if (confirmVariant === 'danger') return BILGEN_TOKENS.colors.danger;
    if (confirmVariant === 'success') return BILGEN_TOKENS.colors.success;
    return BILGEN_TOKENS.colors.accent;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '460px',
          maxWidth: '92vw',
          backgroundColor: '#FFFFFF',
          borderRadius: BILGEN_TOKENS.dimensions.radiusLg,
          border: `1px solid ${BILGEN_TOKENS.colors.border}`,
          boxShadow: BILGEN_TOKENS.shadows.lg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${BILGEN_TOKENS.colors.border}` }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: BILGEN_TOKENS.colors.textPrimary }}>
            {title}
          </h3>
          {(subtitle || description) && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: BILGEN_TOKENS.colors.textSecondary }}>
              {subtitle || description}
            </p>
          )}
        </div>

        <div style={{ padding: '20px' }}>
          {children}
        </div>

        {footer ? (
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: BILGEN_TOKENS.colors.surfaceSubtle,
              borderTop: `1px solid ${BILGEN_TOKENS.colors.border}`,
            }}
          >
            {footer}
          </div>
        ) : (
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: BILGEN_TOKENS.colors.surfaceSubtle,
              borderTop: `1px solid ${BILGEN_TOKENS.colors.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: BILGEN_TOKENS.dimensions.radiusSm,
                border: `1px solid ${BILGEN_TOKENS.colors.border}`,
                backgroundColor: '#FFFFFF',
                color: BILGEN_TOKENS.colors.textSecondary,
                cursor: 'pointer',
              }}
            >
              İptal
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: BILGEN_TOKENS.dimensions.radiusSm,
                border: 'none',
                backgroundColor: getConfirmBg(),
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
