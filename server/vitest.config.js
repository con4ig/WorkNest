import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    setupFiles: ["./test/setup.js"],
    // mongodb-memory-server downloads the binary on first run.
    hookTimeout: 60_000,
    testTimeout: 30_000,
    // Each test file gets its own in-memory Mongo, so they can run in parallel.
    fileParallelism: true,
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
  },
});
