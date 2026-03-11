import js from "@eslint/js"
import globals from "globals"
import react from "eslint-plugin-react"

import reactHooks from "eslint-plugin-react-hooks"

import reactRefresh from "eslint-plugin-react-refresh"
import { defineConfig } from "eslint/config"


export default defineConfig([
  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],

    plugins: {
      react,

      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      "react/react-in-jsx-scope": "off", // not needed with modern React
      "react-refresh/only-export-components": "warn",

      "no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
    },
  },

  {
    ignores: ["dist", "node_modules"],
  },
])
