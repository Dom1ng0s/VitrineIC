// @ts-check
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

/**
 * Lint do VitrineIC. Frontend e backend compartilham as regras de TypeScript;
 * React, hooks e acessibilidade valem só para `src/`.
 *
 * `jsx-a11y` entra como **aviso** porque as correções de acessibilidade são a
 * fase 6 do plano de completude (`docs/plano-de-completude.md`): elevar para
 * erro agora deixaria o CI vermelho desde o primeiro dia. Ao fechar a fase 6,
 * troque `a11ySeverity` para "error" e o lint passa a barrar regressão.
 */
const a11ySeverity = "warn";

/** Recommended do jsx-a11y com a severidade acima no lugar da original. */
const a11yRules = Object.fromEntries(
  Object.keys(jsxA11y.flatConfigs.recommended.rules ?? {}).map((rule) => [rule, a11ySeverity]),
);

export default tseslint.config(
  // `docs/` guarda material de apresentação, não código do produto.
  { ignores: ["dist", "build", "var", "node_modules", "coverage", "docs"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...a11yRules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // Scripts de build e de banco rodam em Node e imprimem no terminal.
    files: ["scripts/**/*.mjs", "server/**/*.ts"],
    rules: { "no-console": "off" },
  },
  prettier,
);
