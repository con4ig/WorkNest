// Subscribe to live project events broadcast by the API for the
// current tenant. The hook attaches listeners to the singleton socket
// from `services/realtime.js` and cleans them up on unmount or when
// the handlers change.
//
// Usage:
//   useProjectRealtime({
//     onStatusChanged: ({ projectId, status }) => { ... },
//     onArchived:      ({ projectId })          => { ... },
//     onRestored:      ({ projectId })          => { ... },
//   });
//
// Server contract is documented in `server/lib/realtime.js`.

import { useEffect, useRef } from "react";
import { getSocket } from "../services/realtime";

export function useProjectRealtime(handlers) {
    // Stash the latest handlers in a ref so we don't tear down /
    // re-bind listeners every time the parent re-renders with new
    // inline arrow functions.
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return undefined;

        const onStatusChanged = (payload) =>
            handlersRef.current?.onStatusChanged?.(payload);
        const onArchived = (payload) =>
            handlersRef.current?.onArchived?.(payload);
        const onRestored = (payload) =>
            handlersRef.current?.onRestored?.(payload);

        socket.on("project:status-changed", onStatusChanged);
        socket.on("project:archived", onArchived);
        socket.on("project:restored", onRestored);

        return () => {
            socket.off("project:status-changed", onStatusChanged);
            socket.off("project:archived", onArchived);
            socket.off("project:restored", onRestored);
        };
    }, []);
}
