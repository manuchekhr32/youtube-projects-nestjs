# Stage 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY entrypoint.sh ./
COPY .env ./

RUN yarn install

COPY . .

RUN yarn build

# Stage 2: Setup prod
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/entrypoint.sh ./entrypoint.sh
COPY --from=builder /usr/src/app/.env ./.env

ENV NODE_ENV production

RUN chmod +x ./entrypoint.sh

USER node

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/main.js"]
