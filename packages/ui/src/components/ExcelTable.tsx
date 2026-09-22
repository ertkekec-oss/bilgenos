import React from 'react';
import { BILGEN_TOKENS } from '../theme/tokens.js';

export interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  isNumeric?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface ExcelTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function ExcelTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Kayıt bulunamadı.',
}: ExcelTableProps<T>): React.ReactElement {
  return (
    <div
      style={{
        border: `1px solid ${BILGEN_TOKENS.colors.border}`,
        backgroundColor: BILGEN_TOKENS.colors.surface,
        borderRadius: BILGEN_TOKENS.dimensions.radius,
        overflow: 'hidden',
        boxShadow: 'none',
      }}
    >
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: BILGEN_TOKENS.typography.fontFamilySans,
            fontSize: '13px',
            color: BILGEN_TOKENS.colors.textPrimary,
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: BILGEN_TOKENS.colors.gridHeader,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                borderBottom: `1px solid ${BILGEN_TOKENS.colors.borderStrong}`,
              }}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    height: BILGEN_TOKENS.dimensions.headerHeight,
                    padding: '0 8px',
                    textAlign: col.align || (col.isNumeric ? 'right' : 'left'),
                    fontWeight: 600,
                    color: BILGEN_TOKENS.colors.textSecondary,
                    borderRight: `1px solid ${BILGEN_TOKENS.colors.border}`,
                    width: col.width,
                    userSelect: 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: BILGEN_TOKENS.colors.textMuted,
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row)}
                  style={{
                    height: BILGEN_TOKENS.dimensions.rowHeight,
                    borderBottom: `1px solid ${BILGEN_TOKENS.colors.border}`,
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                  }}
                >
                  {columns.map((col) => {
                    const value = (row as Record<string, unknown>)[col.key];
                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: '0 8px',
                          textAlign: col.align || (col.isNumeric ? 'right' : 'left'),
                          fontVariantNumeric: col.isNumeric ? 'tabular-nums' : 'normal',
                          fontFamily: col.isNumeric ? BILGEN_TOKENS.typography.fontFamilyMono : 'inherit',
                          borderRight: `1px solid ${BILGEN_TOKENS.colors.border}`,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                      >
                        {col.render ? col.render(row, idx) : (value as React.ReactNode)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
