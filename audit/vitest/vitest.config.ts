import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        pretendToBeVisual: true,
      },
    },
    setupFiles: ["./setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
})
