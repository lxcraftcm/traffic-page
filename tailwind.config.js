/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./public/**/*.{html,js}'],
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5',
                secondary: '#10B981',
                accent: '#F59E0B',
                dark: '#1E293B',
                light: '#F8FAFC',
                intranet: '#10B981',
                extranet: '#3B82F6'
            },
            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
            },
        }
    },
    plugins: [],
}

