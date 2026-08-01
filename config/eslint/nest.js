import { config as baseConfig } from "./base.js"

export const nestJsConfig = [
  ...baseConfig,
  {
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
]
