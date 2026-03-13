/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#8B6347',
                'primary-light': '#C4956A',
                accent: '#C4956A',
                background: '#FFFFFF',
                surface: '#F5EFE6',
                dark: '#3D1F0D',
                light: '#1a1a1a',
                muted: '#6B5B4F',
                cream: '#F5EFE6',
            },
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-in forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
                'slide-up-delay-1': 'slideUp 0.6s ease-out 0.15s forwards',
                'slide-up-delay-2': 'slideUp 0.6s ease-out 0.3s forwards',
                'slide-up-delay-3': 'slideUp 0.6s ease-out 0.45s forwards',
                'bounce-slow': 'bounceDown 2s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(30px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                bounceDown: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(10px)' },
                },
            },
        },
    },
    plugins: [],
}
