# =============================================
# Stage 0: Development (hot-reload with nodemon)
# =============================================
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
# Install ALL deps, including nodemon
RUN npm ci && npm cache clean --force
COPY . .
EXPOSE 5500
CMD ["npm", "run", "dev"]

# =============================================
# Stage 1: Production dependencies only
# =============================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# =============================================
# Stage 2: Production Runtime
# =============================================
FROM node:20-alpine AS production

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S worknest -u 1001 -G nodejs

WORKDIR /app

# Copy only production dependencies
COPY --from=deps --chown=worknest:nodejs /app/node_modules ./node_modules

# Copy source code
COPY --chown=worknest:nodejs . .

# Switch to non-root user
USER worknest

EXPOSE 5500

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5500}/ping || exit 1

CMD ["node", "server.js"]
