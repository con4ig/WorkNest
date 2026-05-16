// Real-time layer — Socket.IO server bound to the existing HTTP listener.
//
// The contract:
//   1. Every connection must present a valid JWT access token in the
//      handshake `auth.token` (or the `?token=` query). Unauthenticated
//      sockets are rejected with `ConnectError`.
//   2. After auth, the socket joins a room named `company:<companyId>`.
//      All real-time events are scoped to that room so cross-tenant
//      leakage is impossible (defence-in-depth on top of ADR-0002).
//   3. The module exposes a tiny `emit` helper that controllers call
//      after a mutation lands — they don't need to know about
//      socket.io semantics, just the company id and a payload.
//
// Events emitted today:
//   - `project:status-changed`  { projectId, status, updatedBy, at }
//   - `project:archived`        { projectId, by, at }
//   - `project:restored`        { projectId, by, at }
//
// Adding a new event = one helper + one controller call. No new wiring.

import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import logger from "./logger.js";

let io = null;

/**
 * Attach Socket.IO to a Node HTTP server. Called from `server.js` once
 * `app.listen()` resolves so the same port serves HTTP and WS.
 *
 * @param {import('http').Server} httpServer
 * @param {{ corsOrigins?: string[] }} [opts]
 */
export function initRealtime(httpServer, opts = {}) {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      // Use the same allowlist as Express; the array is passed in
      // explicitly to keep this module free of env access.
      origin: opts.corsOrigins ?? true,
      credentials: true,
    },
    // Long-poll fallback is on by default; explicit for clarity.
    transports: ["websocket", "polling"],
  });

  // Per-socket auth gate. The token is the same access token issued
  // by `/api/auth/login`; sockets do not see the refresh cookie.
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      // Permit `Authorization: Bearer ...` from non-browser clients.
      (socket.handshake.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!token) {
      return next(new Error("UNAUTHENTICATED: missing token"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // The token payload mirrors the one minted in `authController`:
      // { _id, email, role, company }. We stash it on the socket for
      // downstream handlers.
      socket.data.user = {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
        company: decoded.company,
      };
      return next();
    } catch (err) {
      logger.warn({ err: err.message }, "Socket auth failed");
      return next(new Error("UNAUTHENTICATED: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { _id: userId, company } = socket.data.user;
    if (!company) {
      // No company → no room. Disconnect rather than orphan the socket.
      socket.disconnect(true);
      return;
    }

    const room = `company:${company}`;
    socket.join(room);

    logger.info(
      { userId, company, socketId: socket.id },
      "Realtime: client joined company room"
    );

    socket.on("disconnect", (reason) => {
      logger.info({ userId, company, reason }, "Realtime: client disconnected");
    });
  });

  return io;
}

/**
 * Send an event to every socket connected for a given tenant.
 * Returns `false` if the realtime layer hasn't been initialised
 * (e.g. inside Vitest) so callers can ignore the result safely.
 *
 * @param {string|object} companyId  ObjectId or its `.toString()` form.
 * @param {string} event             Event name, e.g. `project:status-changed`.
 * @param {unknown} payload          JSON-serialisable payload.
 */
export function emitToCompany(companyId, event, payload) {
  if (!io || !companyId) return false;
  io.to(`company:${String(companyId)}`).emit(event, payload);
  return true;
}

/** Test/util escape hatch. Resets the module between Vitest runs. */
export function _resetRealtime() {
  io = null;
}
