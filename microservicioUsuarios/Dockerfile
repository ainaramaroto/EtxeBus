# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Copiamos archivos de dependencias primero para aprovechar cache
COPY package*.json ./

RUN npm ci --omit=dev

# Copiamos el codigo restante del microservicio
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
