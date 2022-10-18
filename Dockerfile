FROM node:16.18.0-alpine3.16 as builder

WORKDIR /app

COPY ./ /app

RUN npm -g install pnpm@7.13.5 && \
    pnpm install && \
    pnpm build

FROM nginx:1.23.1-alpine

RUN apk --no-cache add jq

COPY docker/99-init-env.sh /docker-entrypoint.d

COPY --from=builder /app/dist/ /usr/share/nginx/html
