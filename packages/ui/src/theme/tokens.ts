export const BILGEN_TOKENS = {
  colors: {
    surface: '#FFFFFF',
    surfaceSubtle: '#F8FAFC',
    canvas: '#F1F5F9',
    gridHeader: '#F8FAFC',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',

    // Periodya Sidebar Palette (Deep Slate Navy)
    sidebarBg: '#0F172A',
    sidebarCard: '#1E293B',
    sidebarHover: '#293548',
    sidebarActive: '#2563EB',
    sidebarText: '#94A3B8',
    sidebarTextActive: '#FFFFFF',
    sidebarBorder: '#1E293B',

    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    accent: '#2563EB', // Periodya Corporate Royal Blue
    accentHover: '#1D4ED8',
    accentLight: '#EFF6FF',
    accentBorder: '#BFDBFE',

    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    dangerBorder: '#FECACA',

    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    warningBorder: '#FDE68A',

    success: '#10B981',
    successLight: '#ECFDF5',
    successBorder: '#A7F3D0',

    info: '#0EA5E9',
    infoLight: '#F0F9FF',
    infoBorder: '#BAE6FD',
  },
  typography: {
    fontFamilySans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyMono: 'JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  dimensions: {
    rowHeight: '34px',
    headerHeight: '38px',
    borderWidth: '1px',
    radius: '4px',
    radiusSm: '2px',
    radiusMd: '6px',
    radiusLg: '8px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
    drawer: '-4px 0 24px -2px rgb(0 0 0 / 0.15)',
  },
} as const;
