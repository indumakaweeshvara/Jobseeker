// Professional Color Palette for JobSeeker App
export const COLORS = {
    // Primary Colors
    primary: '#2563EB',
    primaryDark: '#1E40AF',
    primaryLight: '#3B82F6',

    // Secondary Colors
    secondary: '#7C3AED',
    secondaryDark: '#5B21B6',
    secondaryLight: '#8B5CF6',

    // Neutral Colors
    white: '#FFFFFF',
    background: '#F1F5F9',
    card: '#FFFFFF',
    border: '#E2E8F0',

    // Text Colors
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    textLight: '#94A3B8',
    textWhite: '#FFFFFF',

    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0EA5E9',

    // Status Backgrounds
    successBg: '#D1FAE5',
    warningBg: '#FEF3C7',
    errorBg: '#FEE2E2',
    infoBg: '#E0F2FE',

    // Gradient
    gradientStart: '#2563EB',
    gradientEnd: '#7C3AED',

    // Shadows
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
} as const;

export const SIZES = {
    // Font sizes
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,

    // Spacing
    padding: 16,
    margin: 16,
    radius: 12,
    radiusSm: 8,
    radiusLg: 20,
} as const;

export default { COLORS, FONTS, SIZES };
