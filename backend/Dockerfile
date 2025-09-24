# syntax=docker/dockerfile:1
FROM node:18-bullseye

WORKDIR /srv/app

# Install build dependencies for better-sqlite3 / sqlite3
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production \
    PORT=1337 \
    HOST=0.0.0.0

RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]
