FROM node:20-alpine

# Instalar dependências para o canvas e fontes básicas
RUN apk add --no-cache build-base g++ cairo-dev jpeg-dev pango-dev giflib-dev freetype-dev fontconfig ttf-dejavu ttf-liberation font-noto font-noto-cjk font-noto-extra

# Criar diretório para fontes e definir variáveis de ambiente para fontes
RUN mkdir -p /usr/share/fonts/truetype && \
    echo "Setting font config" && \
    fc-cache -f -v

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --ignore-engines --network-timeout 100000

COPY . .
# Ignorar erros durante o build
RUN yarn tsc || true
RUN yarn run copy-assets

EXPOSE 3000

CMD ["node", "dist/index.js"] 