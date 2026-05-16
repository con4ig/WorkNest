import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    css: false,
    // Co-located *.test.{js,jsx} files under src/.
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
  },
});
