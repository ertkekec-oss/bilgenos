export const BILGEN_TOKENS = {
  colors: {
    surface: '#FFFFFF',
    canvas: '#F7F8FA',
    gridHeader: '#F1F3F5',
    border: '#D9DDE3',
    borderStrong: '#B8BEC7',

    textPrimary: '#20242A',
    textSecondary: '#626A73',
    textMuted: '#8A929C',

    accent: '#0F4C81', // Dark corporate blue
    accentHover: '#0C3D68',
    danger: '#C92A2A', // Controlled corporate red
    warning: '#D9730D', // Amber
    success: '#2B8A3E', // Dark green
  },
  typography: {
    fontFamilySans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyMono: 'JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  dimensions: {
    rowHeight: '34px',
    headerHeight: '36px',
    borderWidth: '1px',
    radius: '0px',
  },
} as const;
