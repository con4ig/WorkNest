import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("socket.io-client", () => {
  const onHandlers = new Map();
  const socket = {
    on: vi.fn((event, handler) => onHandlers.set(event, handler)),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
    __handlers: onHandlers,
  };
  return { io: vi.fn(() => socket) };
});

beforeEach(async () => {
  vi.resetModules();
});

describe("realtime service", () => {
  it("connectRealtime(null) returns null and does not open a socket", async () => {
    const { connectRealtime, getSocket } = await import("./realtime");
    const { io } = await import("socket.io-client");

    const result = connectRealtime(null);
    expect(result).toBeNull();
    expect(io).not.toHaveBeenCalled();
    expect(getSocket()).toBeNull();
  });

  it("connectRealtime('some-jwt') calls io() with auth.token", async () => {
    const { connectRealtime } = await import("./realtime");
    const { io } = await import("socket.io-client");

    connectRealtime("some-jwt");
    expect(io).toHaveBeenCalledTimes(1);
    const [, opts] = io.mock.calls[0];
    expect(opts).toMatchObject({ auth: { token: "some-jwt" } });
  });

  it("getSocket() returns null before connect, mock socket after connect", async () => {
    const { connectRealtime, getSocket } = await import("./realtime");

    expect(getSocket()).toBeNull();

    const sock = connectRealtime("jwt-1");
    expect(getSocket()).toBe(sock);
    expect(getSocket()).not.toBeNull();
  });

  it("disconnectRealtime() calls socket.disconnect() and resets getSocket() to null", async () => {
    const { connectRealtime, disconnectRealtime, getSocket } = await import(
      "./realtime"
    );

    const sock = connectRealtime("jwt-2");
    expect(getSocket()).toBe(sock);

    disconnectRealtime();
    expect(sock.disconnect).toHaveBeenCalledTimes(1);
    expect(getSocket()).toBeNull();
  });
});
