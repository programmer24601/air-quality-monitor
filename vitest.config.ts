import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 66,
        branches: 96,
        functions: 87,
        lines: 66
      },
      exclude: [...configDefaults.exclude, "src/index.ts", "**/types/**", "third-party-types/**"]
    }
  }
});
