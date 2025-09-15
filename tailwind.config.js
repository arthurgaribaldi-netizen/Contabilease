/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Configurações de acessibilidade
      screens: {
        'motion-reduce': { raw: '(prefers-reduced-motion: reduce)' },
        'motion-ok': { raw: '(prefers-reduced-motion: no-preference)' },
        'high-contrast': { raw: '(prefers-contrast: high)' },
        'low-contrast': { raw: '(prefers-contrast: low)' },
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Enhanced dark mode colors
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          hover: 'hsl(var(--surface-hover))',
          active: 'hsl(var(--surface-active))',
        },
        text: {
          primary: 'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          tertiary: 'hsl(var(--text-tertiary))',
        },
        shadow: {
          DEFAULT: 'var(--shadow)',
          lg: 'var(--shadow-lg)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        heading: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        body: ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em', fontWeight: '400' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'theme-transition': 'themeTransition 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'dark-glow': 'darkGlow 2s ease-in-out infinite alternate',
        'light-shimmer': 'lightShimmer 2s ease-in-out infinite',
        'dark-shimmer': 'darkShimmer 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        themeTransition: {
          '0%': { opacity: '0.8' },
          '50%': { opacity: '0.9' },
          '100%': { opacity: '1' },
        },
        darkGlow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(96, 165, 250, 0.3), 0 0 40px rgba(96, 165, 250, 0.1)',
            transform: 'scale(1)',
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(96, 165, 250, 0.5), 0 0 60px rgba(96, 165, 250, 0.2)',
            transform: 'scale(1.02)',
          },
        },
        lightShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        darkShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(96, 165, 250, 0.7)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 0 10px rgba(96, 165, 250, 0)',
          },
        },
      },
    },
  },
  plugins: [
    // Plugin para classes de acessibilidade
    function ({ addUtilities, addComponents, theme }) {
      // Utilities para screen readers
      addUtilities({
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.not-sr-only': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: '0',
          margin: '0',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
        '.focus-visible': {
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: theme('colors.blue.500'),
            outlineOffset: '2px',
          },
        },
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 2px ${theme('colors.blue.500')}`,
          },
        },
      });

      // Componentes de acessibilidade
      addComponents({
        '.skip-link': {
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: theme('colors.blue.600'),
          color: theme('colors.white'),
          padding: '8px',
          textDecoration: 'none',
          borderRadius: '0 0 4px 4px',
          zIndex: '1000',
          '&:focus': {
            top: '0',
          },
        },
        '.high-contrast': {
          '& *': {
            color: theme('colors.black'),
            backgroundColor: theme('colors.white'),
            borderColor: theme('colors.black'),
          },
        },
        '.reduced-motion': {
          '& *': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      });
    },
  ],
};
