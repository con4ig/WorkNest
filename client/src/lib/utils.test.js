import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn()", () => {
  it("joins truthy class names and ignores falsy ones", () => {
    expect(cn("foo", null, undefined, false, "bar")).toBe("foo bar");
  });

  it("dedupes conflicting Tailwind utilities (last one wins)", () => {
    // tailwind-merge: later utility of the same group wins.
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles arrays and objects via clsx", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });
});
