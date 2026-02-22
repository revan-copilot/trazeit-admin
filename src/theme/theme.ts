/**
 * Theme Configuration
 * Central source of truth for all design tokens
 */

export const theme = {
    colors: {
        primary: {
            DEFAULT: '#143A79',
            50: '#E8EDF5',
            100: '#D1DBEB',
            200: '#A3B7D7',
            300: '#7593C3',
            400: '#476FAF',
            500: '#143A79',
            600: '#102E61',
            700: '#0C2349',
            800: '#081730',
            900: '#040C18',
        },
        gradient: {
            start: '#E6ECFB',
            end: '#A6C0FE',
        },
        border: '#D5D7DA',
        status: {
            active: '#22C55E',
            inactive: '#EF4444',
        },
        background: {
            white: '#FFFFFF',
            light: '#F9FAFB',
        },
        text: {
            primary: '#111827',
            secondary: '#6B7280',
            muted: '#9CA3AF',
        },
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
    },
    borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
    },
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
} as const;

export type Theme = typeof theme;

export default theme;
