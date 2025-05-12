# Microserviço de Exportação de PDF com Gráfico Radar

Este microserviço permite gerar arquivos PDF contendo gráficos radar a partir de dados enviados via API REST.

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Chart.js
- PDFKit
- Canvas
- Bull (Sistema de Filas)
- Redis

## Pré-requisitos

- Node.js 16+
- Yarn
- Docker e Docker Compose (para produção)
- Redis (para o sistema de filas)

## Instalação

1. Clone este repositório:
```bash
git clone <seu-repositorio>
cd microservice-pdf-export
```

2. Instale as dependências:
```bash
yarn install
```

3. Crie um arquivo `.env` na raiz do projeto:
```
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=*

# Configurações do Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Configurações de fila
QUEUE_CONCURRENCY=2
QUEUE_RATE_LIMIT_MAX=10
QUEUE_RATE_LIMIT_DURATION=60000
```

## Execução

### Desenvolvimento

```bash
yarn dev
```

### Produção com Docker

```bash
docker-compose up -d
```

### Produção sem Docker

```bash
yarn build
yarn start
```

## Implantação no VPS com Docploy

1. Certifique-se de ter o Docker e Docploy instalados no seu VPS
2. Clone o repositório no servidor:
   ```bash
   git clone https://github.com/JancarlosAVB/microservice-pdf-export.git
   cd microservice-pdf-export
   ```

3. Crie o arquivo `.env` com as configurações corretas

4. Implante com Docploy:
   ```bash
   docploy deploy
   ```

5. Verificar o status:
   ```bash
   docploy status
   ```

## Sistema de Filas

Este microserviço utiliza Bull com Redis para gerenciar filas de geração de PDFs e gráficos. Isso permite:

- Processar solicitações pesadas em segundo plano
- Limitar taxa de requisições
- Retry automático em caso de falhas
- Monitoramento de status

### Endpoints de Monitoramento

- `GET /api/queue/stats` - Estatísticas de todas as filas
- `GET /api/queue/:queueName/jobs/:jobId` - Status de um job específico
- `DELETE /api/queue/:queueName/jobs/waiting` - Limpar trabalhos em espera

### Uso da Fila na API

Para utilizar o sistema de filas ao solicitar a geração de um PDF, adicione o parâmetro `useQueue: true` na requisição:

```json
{
  "formData": { ... },
  "pdfOptions": { ... },
  "useQueue": true,
  "callbackUrl": "https://exemplo.com/callback" // Opcional
}
```

A resposta incluirá um `jobId` que pode ser usado para consultar o status do trabalho.

## API

### Gerar PDF com Gráfico Radar

**Endpoint**: `POST /api/radar-chart-pdf`

**Corpo da Requisição**:

```json
{
  "chartData": {
    "labels": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"],
    "datasets": [
      {
        "label": "Visitantes 2023",
        "data": [65, 59, 80, 81, 56, 55],
        "backgroundColor": "rgba(75, 192, 192, 0.2)",
        "borderColor": "rgba(75, 192, 192, 1)",
        "borderWidth": 1,
        "pointBackgroundColor": "rgba(75, 192, 192, 1)",
        "pointBorderColor": "#fff",
        "pointRadius": 3,
        "fill": true
      }
    ],
    "title": "Radar Chart",
    "width": 600,
    "height": 400
  },
  "pdfOptions": {
    "title": "Showing total visitors for the last 6 months",
    "author": "Sistema de Relatórios",
    "subject": "Análise de Visitantes",
    "fileName": "radar-chart-visitors.pdf",
    "pageSize": "A4",
    "pageOrientation": "portrait"
  },
  "useQueue": false // Opcional, usar sistema de filas
}
```

**Resposta**: 
- Se `useQueue: false` (padrão): Arquivo PDF para download
- Se `useQueue: true`: Status 202 com ID do job na fila

## Notas

- A API aceita dados no formato JSON com um limite máximo de 10MB
- É possível personalizar as cores do gráfico ou deixar que o sistema gere cores aleatórias
- As opções do PDF são todas opcionais e possuem valores padrão

## Licença

MIT 