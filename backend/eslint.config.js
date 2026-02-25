export default [
  {
    ignores: ["node_modules/**", "coverage/**"],
  },
  {
    files: ["src/**/*.js", "*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {},
  },
];
