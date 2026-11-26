import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Testes do frontend. Rodam sem banco: `src/lib` é testado contra `fetch`
 * dublado, e os componentes contra jsdom. Os testes de integração da API
 * continuam em `server/tests/` com o runner do Node (`pnpm test:api`).
 */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
