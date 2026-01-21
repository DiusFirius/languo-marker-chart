import globals from "globals";

export default [
  {
    ignores: ["node_modules/**"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      "semi": ["error", "always"],
      "indent": ["error", 4],
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1 }],
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "brace-style": ["error", "1tbs"],
      "no-var": "error",
      "prefer-const": "warn"
    }
  },
  {
    files: ["js/markers-data.js"],
    languageOptions: {
      globals: {
        module: "readonly"
      }
    }
  }
];
