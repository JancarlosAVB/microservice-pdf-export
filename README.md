# Microserviço de Exportação de PDF com Gráfico Radar

Este microserviço permite gerar arquivos PDF contendo gráficos radar a partir de dados enviados via API REST.

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Chart.js
- PDFKit
- Canvas

## Pré-requisitos

- Node.js 16+
- Yarn

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

3. Crie um arquivo `.env` na raiz do projeto (opcional):
```
PORT=3000
NODE_ENV=development
```

## Execução

### Desenvolvimento

```bash
yarn dev
```

### Produção

```bash
yarn build
yarn start
```

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
  }
}
```

**Resposta**: Arquivo PDF para download

## Notas

- A API aceita dados no formato JSON com um limite máximo de 10MB
- É possível personalizar as cores do gráfico ou deixar que o sistema gere cores aleatórias
- As opções do PDF são todas opcionais e possuem valores padrão

## Licença

MIT 