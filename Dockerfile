FROM node:16.18.0-alpine3.16 as builder

WORKDIR /app

COPY ./ /app

RUN npm -g install pnpm@7.13.5 && \
    pnpm install && \
    pnpm build

FROM nginx:1.23.1-alpine

WORKDIR /app

COPY --from=builder /app/dist/ /usr/share/nginx/html
