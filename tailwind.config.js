/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Wild West colors
    'from-wild-west-600', 'to-wild-west-700', 'from-wild-west-700', 'to-wild-west-800',
    'text-wild-west-200', 'text-wild-west-300', 'text-wild-west-400', 'text-wild-west-500', 'text-wild-west-600', 'text-wild-west-700', 'text-wild-west-800', 'text-wild-west-900',
    'bg-wild-west-100', 'bg-wild-west-200', 'bg-wild-west-300', 'bg-wild-west-400', 'bg-wild-west-500', 'bg-wild-west-600', 'bg-wild-west-700', 'bg-wild-west-800', 'bg-wild-west-900',
    'border-wild-west-400', 'border-wild-west-600', 'border-wild-west-800',
    // Desert colors
    'from-desert-800', 'to-desert-900',
    // Saloon colors
    'from-saloon-600', 'to-saloon-700', 'from-saloon-700', 'to-saloon-800',
    'from-saloon-100', 'to-wild-west-100', 'from-saloon-50', 'to-wild-west-50',
    'from-saloon-900', 'to-wild-west-900',
    // Custom fonts
    'font-western', 'font-elegant', 'font-spooky', 'font-pirate',
    // Custom animations
    'animate-draw', 'animate-smoke', 'animate-dust', 'animate-parallax-slow', 'animate-parallax-fast', 'animate-bounce-slow',
    // Custom shadows
    'shadow-western', 'shadow-saloon',
    // Background patterns
    'bg-western-pattern', 'bg-wood-grain',
  ],
  theme: {
    extend: {
      fontFamily: {
        'western': ['Rye', 'serif'],
        'elegant': ['Cinzel', 'serif'],
        'spooky': ['Creepster', 'cursive'],
        'pirate': ['Pirata One', 'cursive'],
      },
      colors: {
        'wild-west': {
          50: '#fefaf5',
          100: '#fdf4e6',
          200: '#fae6c7',
          300: '#f6d19e',
          400: '#f0b473',
          500: '#e89550',
          600: '#d97a3e',
          700: '#b45f34',
          800: '#914e32',
          900: '#76422c',
          950: '#402217',
        },
        'desert': {
          50: '#fdf8f0',
          100: '#fbf0db',
          200: '#f7dfb7',
          300: '#f0c788',
          400: '#e8a957',
          500: '#e29334',
          600: '#d37f29',
          700: '#af6624',
          800: '#8c5325',
          900: '#724621',
          950: '#3e2310',
        },
        'saloon': {
          50: '#f7f3f0',
          100: '#ede4dc',
          200: '#dcc8b9',
          300: '#c6a691',
          400: '#b28670',
          500: '#a1735a',
          600: '#94654f',
          700: '#7a5443',
          800: '#64463a',
          900: '#523b31',
          950: '#2b1e19',
        }
      },
      animation: {
        'draw': 'draw 0.3s ease-in-out',
        'smoke': 'smoke 2s ease-in-out infinite',
        'dust': 'dust 1s ease-in-out infinite',
        'parallax-slow': 'parallax 20s linear infinite',
        'parallax-fast': 'parallax 10s linear infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
      },
      keyframes: {
        draw: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        smoke: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-20px) scale(1.5)', opacity: '0' },
        },
        dust: {
          '0%': { transform: 'translateX(-10px)', opacity: '0.6' },
          '50%': { transform: 'translateX(10px)', opacity: '0.3' },
          '100%': { transform: 'translateX(-10px)', opacity: '0.6' },
        },
        parallax: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      backgroundImage: {
        'western-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d97a3e\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'wood-grain': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"20\" viewBox=\"0 0 100 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z\" fill=\"%23b45f34\" fill-opacity=\"0.05\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')",
      },
      boxShadow: {
        'western': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(212, 122, 62, 0.04)',
        'saloon': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(161, 115, 90, 0.04)',
      }
    },
  },
  plugins: [],
}
