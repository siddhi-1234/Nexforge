// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'nex-dark': '#05070A',
        'nex-card': '#11141D',
        'nex-blue': '#00B0FF',
        'nex-purple': '#6200EE',
      },
      keyframes: {
        // High-velocity impact animation
        forgeStrike: {
          '0%, 100%': { transform: 'rotate(0deg) translateY(0)' },
          '15%': { transform: 'rotate(-25deg) translateY(-15px)' }, // Wind up
          '30%': { transform: 'rotate(12deg) translateY(8px)' },   // The Strike
          '45%': { transform: 'rotate(0deg) translateY(0)' },     // Recoil
        },
        // Particles flying from the anvil
        sparkBlast: {
          '0%': { opacity: '0', transform: 'scale(0) translate(0, 0)' },
          '20%': { opacity: '1' },
          '100%': {
            opacity: '0',
            transform: 'scale(1.2) translate(var(--tw-translate-x), var(--tw-translate-y))'
          },
        },
        // Subtle glow for the "Active Streak" effect
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(8px)' },
          '50%': { opacity: '1', filter: 'blur(12px)' },
        }
      },
      animation: {
        'hammer-hit': 'forgeStrike 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'spark-1': 'sparkBlast 1.8s ease-out infinite',
      }
    },
  },
}