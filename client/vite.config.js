import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In Docker, containers talk via service names (e.g. 'server'); locally
// via localhost. The env variable handles both cases.
const target = process.env.VITE_API_TARGET || 'http://localhost:5500';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        watch: {
            usePolling: true,
        },
        proxy: {
            '/api': {
                target,
                changeOrigin: true,
            },
            // Socket.IO handshake + transport. `ws: true` upgrades the
            // long-polling path to a real WebSocket connection.
            '/socket.io': {
                target,
                ws: true,
                changeOrigin: true,
            },
        },
    },
});
