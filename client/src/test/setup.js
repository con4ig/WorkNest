// Frontend test setup — Vitest + jsdom.
//
// Imports `@testing-library/jest-dom` matchers (e.g. `.toBeInTheDocument()`)
// and runs `cleanup` between tests so DOM state never leaks.

import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
