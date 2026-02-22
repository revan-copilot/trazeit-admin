/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
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
                highlight: '#07275D',
                gradient: {
                    start: '#E6ECFB',
                    end: '#A6C0FE',
                },
                border: {
                    DEFAULT: '#D5D7DA',
                },
                status: {
                    active: '#22C55E',
                    inactive: '#EF4444',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-body': 'linear-gradient(135deg, #E6ECFB 0%, #A6C0FE 100%)',
            },
        },
    },
    plugins: [],
}


