# ---------- 1) Build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Variables públicas de Vite: se incrustan en el bundle al compilar.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- 2) Servir con Nginx ----------
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
