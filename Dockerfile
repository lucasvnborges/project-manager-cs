FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN chmod +x docker/entrypoint.sh

EXPOSE 3000

CMD ["./docker/entrypoint.sh"]
