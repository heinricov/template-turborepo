import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 15000,
    env: {
      JWT_SECRET: "audit-security-test-secret",
      NODE_ENV: "test",
    },
    include: ["src/**/*.test.ts"],
  },
})
