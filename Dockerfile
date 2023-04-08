FROM node:18.15.0-alpine3.17 as builder

WORKDIR /app

COPY ./ /app

RUN apk --no-cache add git && \
    npm -g install pnpm@8.1.1 && \
    pnpm install && \
    pnpm build

FROM nginx:1.23.4-alpine3.17-slim

RUN apk --no-cache add jq

COPY docker/99-init-env.sh /docker-entrypoint.d

COPY --from=builder /app/dist/ /usr/share/nginx/html
