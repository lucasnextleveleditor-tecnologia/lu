import type { Config } from "tailwindcss";

// Design system "Futurista Minimalista" — fundo absoluto em preto (#000000),
// superfícies em tons de zinc ultra-escuro e tipografia em branco puro/cinza
// claro. É a identidade FIXA de toda a plataforma (login, admin, área de
// membros) — não muda por personalização de cliente; a única coisa
// configurável por área é a logotipo (ver `components/branding/BrandingLogo`
// + `app/login/page.tsx` vs. `app/admin/layout.tsx` / `app/dashboard/layout.tsx`).
//
// `accent`/`accent2` continuam no formato `rgb(var(--x) / <alpha-value>)` —
// é o que permite `bg-accent/10`, `border-accent/30` etc. — mas agora as
// variáveis CSS são CONSTANTES fixas declaradas em `globals.css` (não lidas
// mais de `branding_config`/admin). `base`, `ink`, `status` e `danger`
// seguem FIXOS e validados por contraste (skill de dataviz).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          950: "#000000",
          900: "#09090b",
          850: "#111113",
          800: "#18181b",
          700: "#27272a",
          600: "#3f3f46",
        },
        ink: {
          primary: "#ffffff",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          strong: "rgb(var(--color-accent-strong) / <alpha-value>)",
        },
        // Acento secundário — usado no glow sutil do fundo da tela de login e
        // como destaque secundário. Fixo (ver acima), não customizável.
        accent2: {
          DEFAULT: "rgb(var(--color-accent-2) / <alpha-value>)",
        },
        // Paleta de status FIXA e validada (skill de dataviz interno): 4 tons
        // reservados para estado (good/warning/serious/critical), nunca usados
        // como cor de série/categórica, sempre com contraste ≥3:1 no fundo
        // escuro do app (uso em preenchimento/borda/ponto — nunca em texto
        // pequeno direto, ver `danger` abaixo) e sempre acompanhados de ícone
        // + rótulo — nunca só cor. `neutral` é um 5º tom, fora da escala
        // reservada, para estados que não são "bons nem ruins" (ex: acesso
        // suspenso manualmente).
        status: {
          good: "#0ca30c",
          warning: "#fab219",
          serious: "#ec835a",
          critical: "#d03b3b",
          neutral: "#8a8783",
        },
        // Variante SÓ PARA TEXTO de `status.critical`: a cor de preenchimento
        // (#d03b3b) fica em 4.12:1 no fundo mais escuro do app — passa o piso
        // de 3:1 para preenchimento/ícone, mas fica abaixo de 4.5:1 (AA texto
        // normal) para textos pequenos, como mensagens de erro de formulário.
        // `danger` é a mesma família de vermelho, clareada até 5.54:1.
        danger: "#e35a5a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
