/**
 * Professional Color Palette for JobSeeker App
 * @module theme/colors
 * @description Defines the core color system used throughout the application
 */

/** Color palette type definition */
export type ColorKey = keyof typeof COLORS;

export const COLORS = {
    light: {
        primary: '#2563EB',
        primaryDark: '#1E40AF',
        primaryLight: '#3B82F6',
        secondary: '#7C3AED',
        background: '#F1F5F9',
        card: '#FFFFFF',
        textPrimary: '#1E293B',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        white: '#FFFFFF',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#0EA5E9',
        shadow: '#64748B',
        textLight: '#94A3B8',
        buttonText: '#FFFFFF',
    },
    dark: {
        primary: '#3B82F6',
        primaryDark: '#1E3A8A',
        primaryLight: '#60A5FA',
        secondary: '#A78BFA',
        background: '#0F172A',
        card: '#1E293B',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: '#334155',
        white: '#FFFFFF',
        success: '#34D399',
        error: '#F87171',
        warning: '#FBBF24',
        info: '#38BDF8',
        shadow: '#000000',
        textLight: '#64748B',
        buttonText: '#FFFFFF',
    }
} as const;

export type ThemeColors = typeof COLORS.light;

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
