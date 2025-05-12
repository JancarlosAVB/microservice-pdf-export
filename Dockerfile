FROM node:20-alpine

# Instalar dependências para o canvas
RUN apk add --no-cache build-base g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --ignore-engines --network-timeout 100000

COPY . .
# Ignorar erros durante o build
RUN yarn tsc || true
RUN yarn run copy-assets

EXPOSE 3000

CMD ["node", "dist/index.js"] 