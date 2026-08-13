import type { Config } from "tailwindcss";

// Paleta "Dark Mode Cinematográfico" da Lume Strada Filmes: fundo quase preto,
// tipografia em branco suave e um acento (âmbar, lembrando a luz de
// marquise/projeção de cinema) usado com moderação em ações primárias e
// estados de destaque.
//
// `accent` e `accent2` NÃO são hex fixos — são `rgb(var(--x) / <alpha-value>)`,
// lidos das variáveis CSS injetadas pelo layout raiz (ver
// `lib/branding/getBrandingConfig.ts` + `lib/utils/color.ts`) a partir do que
// o admin configurar no painel de Aparência (`/admin/aparencia`). O formato
// `rgb(var(--x) / <alpha-value>)` é o que permite `bg-accent/10`,
// `border-accent/30` etc. continuarem funcionando com uma cor DINÂMICA — é
// o próprio Tailwind quem substitui `<alpha-value>` pelo modificador de
// opacidade da classe. `base`, `ink`, `status` e `danger` seguem FIXOS e
// validados por contraste (skill de dataviz) — branding troca a cor de
// destaque, nunca a paleta de leitura/estado que já foi auditada.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          950: "#050505",
          900: "#0a0a0a",
          850: "#111111",
          800: "#161616",
          700: "#242424",
          600: "#333333",
        },
        ink: {
          primary: "#f5f4f2",
          secondary: "#a6a3a0",
          muted: "#6f6c69",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          strong: "rgb(var(--color-accent-strong) / <alpha-value>)",
        },
        // Segunda cor customizável do branding ("cor de fundo/acentuação") —
        // usada no fundo da tela de login e como destaque secundário,
        // deliberadamente separada de `accent` (que dirige botões/links/
        // badges) pra não competir visualmente com a ação primária.
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
