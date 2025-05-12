#!/bin/bash

# Script para instalar e configurar o microserviço no VPS Hostinger com Docploy

echo "Iniciando instalação do microserviço PDF Export no VPS..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não está instalado. Instalando..."
    # Instalar o Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "Docker instalado com sucesso!"
else
    echo "Docker já está instalado."
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose não está instalado. Instalando..."
    # Instalar o Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose instalado com sucesso!"
else
    echo "Docker Compose já está instalado."
fi

# Verificar se o Docploy está instalado
if ! command -v docploy &> /dev/null; then
    echo "Docploy não está instalado. Instalando..."
    # Instalar o Docploy
    curl -fsSL https://get.docploy.com -o get-docploy.sh
    sudo sh get-docploy.sh
    echo "Docploy instalado com sucesso!"
else
    echo "Docploy já está instalado."
fi

# Criar diretório tmp para arquivos temporários
mkdir -p tmp
chmod 777 tmp

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cat > .env << EOL
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=*

# Configurações do Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Configurações de fila
QUEUE_CONCURRENCY=2
QUEUE_RATE_LIMIT_MAX=10
QUEUE_RATE_LIMIT_DURATION=60000
EOL
    echo "Arquivo .env criado com sucesso!"
else
    echo "Arquivo .env já existe."
fi

# Iniciar o serviço com o Docker Compose
echo "Iniciando o serviço com Docker Compose..."
docker-compose up -d

echo "Verificando status dos containers..."
docker-compose ps

echo "Instalação concluída com sucesso!"
echo "O microserviço está rodando em: http://localhost:3000"
echo "Para verificar os logs, use: docker-compose logs -f"
echo "Para parar o serviço, use: docker-compose down" 