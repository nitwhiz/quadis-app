FROM node:16.14.2-alpine as builder

RUN npm install -g pnpm

COPY ./ /tmp/build

RUN cd /tmp/build && pnpm install && pnpm build

FROM nginx:1.21.6-alpine

COPY --from=builder /tmp/build/dist/ /usr/share/nginx/html/
