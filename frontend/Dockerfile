FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx vite build

FROM alpine:3.22 AS export
WORKDIR /app
COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "mkdir -p /out && rm -rf /out/* && cp -r /app/dist/. /out/ && echo 'Frontend bundle exported to /out'"]
