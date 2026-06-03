# =============================================
# Stage 1: Build
# =============================================
FROM node:26-alpine AS build
WORKDIR /app

# Copy package files for layer cache
COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# =============================================
# Stage 2: Production (Nginx)
# =============================================
FROM nginx:1.31-alpine AS production

# Security: remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Non-root nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
