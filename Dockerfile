FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]