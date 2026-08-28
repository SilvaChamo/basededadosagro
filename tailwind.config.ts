import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            screens: {
                // Ecrãs grandes/gigantes (iMac, monitores 21"+, 4K/5K) — usados para
                // grelhas de conteúdo ganharem mais colunas à medida que o ecrã cresce,
                // além do que os breakpoints padrão (até 2xl=1536px) já cobrem.
                "3xl": "1920px",
                "4xl": "2560px",
            },
            colors: {
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
                sidebar: {
                    DEFAULT: "var(--sidebar)",
                    foreground: "var(--sidebar-foreground)",
                    primary: "var(--sidebar-primary)",
                    "primary-foreground": "var(--sidebar-primary-foreground)",
                    accent: "var(--sidebar-accent)",
                    "accent-foreground": "var(--sidebar-accent-foreground)",
                    border: "var(--sidebar-border)",
                    ring: "var(--sidebar-ring)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                agro: "var(--radius-agro)",
                "agro-lg": "var(--radius-agro-lg)",
                "agro-btn": "var(--radius-agro-btn)",
            },
            fontFamily: {
                // Maven Pro em toda a app, sem mistura — heading e serif
                // apontam para a mesma fonte que sans.
                sans: ["var(--font-maven-pro)", "sans-serif"],
                heading: ["var(--font-maven-pro)", "sans-serif"],
                serif: ["var(--font-maven-pro)", "sans-serif"],
            },
            spacing: {
                agro: "var(--gap-agro)",
            },
            keyframes: {
                shine: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
            },
            animation: {
                shine: "shine 0.8s ease-out forwards",
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};

export default config;
