FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM joseluisq/static-web-server:2-alpine
COPY --from=builder /app/dist /public
ENV SERVER_ROOT=/public
ENV SERVER_FALLBACK_PAGE=/public/index.html
ENV SERVER_PORT=80
# A /health endpoint that answers 200 and writes no access-log line, which is
# what the compose healthcheck and the server's deploy script probe.
ENV SERVER_HEALTH=true
# What a browser may keep: a page is checked on every visit, the hashed bundles
# it names are kept for a year. Without it static-web-server caches the page
# itself for a day, and it then asks the next build for bundles it does not have.
COPY sws.toml /etc/sws.toml
ENV SERVER_CONFIG_FILE=/etc/sws.toml
EXPOSE 80
