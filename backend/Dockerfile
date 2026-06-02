FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY prisma ./prisma

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
