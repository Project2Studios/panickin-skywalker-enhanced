import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Extended Band Color Palette
        'superhero-blue': {
          DEFAULT: "var(--superhero-blue)",
          foreground: "var(--superhero-blue-foreground)",
        },
        'anxiety-purple': {
          DEFAULT: "var(--anxiety-purple)",
          foreground: "var(--anxiety-purple-foreground)",
        },
        'panic-red': {
          DEFAULT: "var(--panic-red)",
          foreground: "var(--panic-red-foreground)",
        },
        'calm-green': {
          DEFAULT: "var(--calm-green)",
          foreground: "var(--calm-green-foreground)",
        },
        'energy-orange': {
          DEFAULT: "var(--energy-orange)",
          foreground: "var(--energy-orange-foreground)",
        },
        'store-accent': {
          DEFAULT: "var(--store-accent)",
          foreground: "var(--store-accent-foreground)",
        },
        'limited-edition': {
          DEFAULT: "var(--limited-edition)",
          foreground: "var(--limited-edition-foreground)",
        },
        'tour-exclusive': {
          DEFAULT: "var(--tour-exclusive)",
          foreground: "var(--tour-exclusive-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        'display': ['clamp(4rem, 8vw, 10rem)', { lineHeight: '0.9', letterSpacing: '0.02em' }],
        'hero': ['clamp(3rem, 6vw, 8rem)', { lineHeight: '0.9', letterSpacing: '0.02em' }],
        'section': ['clamp(2.5rem, 5vw, 6rem)', { lineHeight: '1.1', letterSpacing: '0.05em' }],
      },
      letterSpacing: {
        'ultra-wide': '0.2em',
        'mega-wide': '0.3em',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        // Band-specific animations
        'limited-pulse': {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 4px 15px hsla(45, 100%, 60%, 0.4)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 6px 25px hsla(45, 100%, 60%, 0.6)",
          },
        },
        'product-shimmer': {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        'category-hover': {
          "0%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-4px) rotate(1deg)" },
          "75%": { transform: "translateY(-2px) rotate(-0.5deg)" },
          "100%": { transform: "translateY(0) rotate(0deg)" },
        },
        'add-to-cart-success': {
          "0%": { transform: "scale(1)" },
          "50%": { 
            transform: "scale(1.1)",
            background: "linear-gradient(135deg, hsl(140 60% 55%), hsl(330 100% 55%))",
          },
          "100%": { transform: "scale(1)" },
        },
        'wishlist-heart': {
          "0%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.2) rotate(5deg)" },
          "50%": { transform: "scale(1.1) rotate(-3deg)" },
          "75%": { transform: "scale(1.15) rotate(2deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        bounce: "bounce 1s infinite",
        // Band-specific animations
        'limited-pulse': 'limited-pulse 2s infinite',
        'product-shimmer': 'product-shimmer 2s infinite linear',
        'category-hover': 'category-hover 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'add-to-cart-success': 'add-to-cart-success 0.6s ease',
        'wishlist-heart': 'wishlist-heart 0.6s',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
