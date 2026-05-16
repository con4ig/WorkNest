// Client-side Socket.IO singleton.
//
// Lifecycle:
//   - `connectRealtime(token)` is called by `AuthContext` once an
//     access token is available (login / refresh).
//   - `disconnectRealtime()` is called on logout or when the token is
//     wiped.
//   - `getSocket()` returns the current socket, or `null` if no auth
//     session is active. Components should treat `null` as "real-time
//     unavailable, fall back to polling/manual refresh".
//
// The server enforces tenant isolation server-side ([ADR-0002]); the
// client does not need to (and must not) trust an event's claim about
// which tenant it belongs to.

import { io } from "socket.io-client";

let socket = null;

/**
 * Open a socket and authenticate it with the given JWT.
 * Idempotent: calling twice with the same token is a no-op.
 *
 * @param {string} token  Access token (same one used for REST `Authorization`).
 */
export function connectRealtime(token) {
    if (!token) return null;
    if (socket && socket.connected) return socket;

    // The realtime endpoint lives on the same host as the API.
    // - In dev, `VITE_API_URL` is unset and the Vite proxy forwards
    //   `/socket.io` to the backend, so we omit the URL (same-origin).
    // - In prod, `VITE_API_URL` is e.g. `https://worknest-api.onrender.com/api`;
    //   strip the trailing `/api` to get the WS origin.
    const apiUrl = import.meta.env.VITE_API_URL;
    const url = apiUrl ? apiUrl.replace(/\/api\/?$/, "") : undefined;

    socket = io(url, {
        auth: { token },
        transports: ["websocket", "polling"],
        // Don't auto-reconnect forever; back off and stop after a while
        // so a permanently-dead server doesn't hammer the network.
        reconnectionAttempts: 8,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10_000,
    });

    socket.on("connect_error", (err) => {
        // Surfaced in dev console; real recovery is handled by the
        // reconnect logic above.
        if (import.meta.env.DEV) {
            console.warn("[realtime] connect error:", err.message);
        }
    });

    return socket;
}

/**
 * Tear down the socket. Safe to call when no socket exists.
 */
export function disconnectRealtime() {
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
}

/**
 * Access the current socket. Returns `null` if `connectRealtime` was
 * never called or the connection was torn down.
 */
export function getSocket() {
    return socket;
}
