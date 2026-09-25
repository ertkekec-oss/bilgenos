import React from 'react';
import { BILGEN_TOKENS } from '../theme/tokens.js';

export interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filterOptions?: Array<{ label: string; value: string }>;
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  secondaryActions?: React.ReactNode;
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Kayıtlarda ara...',
  filterOptions,
  activeFilter,
  onFilterChange,
  primaryAction,
  secondaryActions,
}: FilterToolbarProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '14px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              height: '32px',
              padding: '0 10px 0 28px',
              fontSize: '12px',
              fontFamily: BILGEN_TOKENS.typography.fontFamilySans,
              borderRadius: BILGEN_TOKENS.dimensions.radiusSm,
              border: `1px solid ${BILGEN_TOKENS.colors.border}`,
              backgroundColor: '#FFFFFF',
              color: BILGEN_TOKENS.colors.textPrimary,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ position: 'absolute', left: '8px', top: '7px', fontSize: '13px', color: '#94A3B8' }}>
            🔍
          </span>
        </div>

        {/* Filter Chips */}
        {filterOptions && onFilterChange && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {filterOptions.map((opt) => {
              const isSelected = activeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onFilterChange(opt.value)}
                  style={{
                    height: '32px',
                    padding: '0 10px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: BILGEN_TOKENS.dimensions.radiusSm,
                    border: `1px solid ${isSelected ? BILGEN_TOKENS.colors.accent : BILGEN_TOKENS.colors.border}`,
                    backgroundColor: isSelected ? BILGEN_TOKENS.colors.accentLight : '#FFFFFF',
                    color: isSelected ? BILGEN_TOKENS.colors.accent : BILGEN_TOKENS.colors.textSecondary,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {secondaryActions}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            style={{
              height: '32px',
              padding: '0 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: BILGEN_TOKENS.dimensions.radiusSm,
              border: 'none',
              backgroundColor: BILGEN_TOKENS.colors.accent,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: BILGEN_TOKENS.shadows.sm,
            }}
          >
            {primaryAction.icon && <span>{primaryAction.icon}</span>}
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
