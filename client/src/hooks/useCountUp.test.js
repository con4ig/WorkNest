import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountUp } from "./useCountUp";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useCountUp", () => {
  it("returns 0 on initial render", () => {
    const { result } = renderHook(() => useCountUp(100, 1000));
    expect(result.current).toBe(0);
  });

  it("returns exactly endValue after the full duration has elapsed", () => {
    const { result } = renderHook(() => useCountUp(100, 1000));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(100);
  });

  it("returns an intermediate value between 0 and endValue midway through", () => {
    const { result } = renderHook(() => useCountUp(100, 1000));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);
  });

  it("restarts the animation toward a new endValue when the prop changes", () => {
    const { result, rerender } = renderHook(
      ({ end }) => useCountUp(end, 1000),
      { initialProps: { end: 100 } },
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(100);

    // Change endValue mid-life and run timers to completion.
    rerender({ end: 250 });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(250);
  });
});
