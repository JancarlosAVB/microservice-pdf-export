import express from 'express';
import cors from 'cors';
import { config } from './config';
import chartRoutes from './routes/chart.routes';
import formRoutes from './routes/form.routes';
import { errorHandler, notFoundHandler } from './utils/error-handler';
import { FormController } from './controllers/form.controller';
import { QueueService, QueueType } from './services/queue.service';
import queueRoutes from './routes/queue.routes';
import path from 'path';

// Inicializar o aplicativo Express
const app = express();
const formController = new FormController();

// Inicializar o serviço de filas
const queueService = QueueService.getInstance();

// Middleware
app.use(cors(config.corsOptions));
app.use(express.json({ limit: '10mb' })); // Aumentar limite para permitir envio de dados maiores

// Logs de requisição detalhados
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Servir arquivos estáticos
app.use('/static', express.static(path.join(__dirname, 'public')));

// Rota de Dashboard para monitoramento da fila
app.get('/dashboard', async (req, res) => {
  try {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard da Fila - Microserviço PDF</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
          h1 { color: #0066cc; margin-bottom: 20px; }
          .container { max-width: 1200px; margin: 0 auto; }
          .stats-container { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
          .queue-card { background: #f8f9fa; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex: 1; min-width: 300px; }
          .queue-card h2 { margin-top: 0; color: #0066cc; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .stat-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #eee; }
          .stat-label { font-weight: bold; }
          .stat-value { text-align: right; }
          .stat-value.high { color: #dc3545; font-weight: bold; }
          .stat-value.medium { color: #fd7e14; font-weight: bold; }
          .stat-value.low { color: #28a745; }
          .refresh-btn { background: #0066cc; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
          .refresh-btn:hover { background: #0056b3; }
          .timestamp { font-style: italic; color: #6c757d; margin-bottom: 20px; }
          .server-info { background: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .server-info h3 { margin-top: 0; }
          .loading { display: none; margin-left: 10px; }
          @media (max-width: 768px) {
            .queue-card { min-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Dashboard de Monitoramento da Fila</h1>
          <p class="timestamp">Última atualização: <span id="timestamp">${new Date().toLocaleString()}</span></p>
          
          <button class="refresh-btn" onclick="refreshStats()">Atualizar <span class="loading" id="loading">⟳</span></button>
          
          <div class="stats-container" id="stats-container">
            <!-- Dados carregados via JavaScript -->
          </div>
          
          <div class="server-info" id="server-info">
            <h3>Informações do Servidor</h3>
            <!-- Dados carregados via JavaScript -->
          </div>
        </div>
        
        <script>
          // Função para atualizar cores com base no valor
          function getColorClass(value, highThreshold, mediumThreshold) {
            if (value > highThreshold) return 'high';
            if (value > mediumThreshold) return 'medium';
            return 'low';
          }
          
          // Função para atualizar os dados
          function refreshStats() {
            const loading = document.getElementById('loading');
            loading.style.display = 'inline';
            
            fetch('/api/queue/stats/summary')
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  const statsContainer = document.getElementById('stats-container');
                  const serverInfo = document.getElementById('server-info');
                  const timestamp = document.getElementById('timestamp');
                  
                  // Atualizar timestamp
                  timestamp.textContent = new Date().toLocaleString();
                  
                  // Limpar e reconstruir o container de estatísticas
                  statsContainer.innerHTML = '';
                  
                  // Adicionar card de resumo do sistema
                  const summaryCard = document.createElement('div');
                  summaryCard.className = 'queue-card';
                  summaryCard.innerHTML = \`
                    <h2>Resumo do Sistema</h2>
                    <div class="stat-row">
                      <span class="stat-label">Status do Sistema:</span>
                      <span class="stat-value \${getColorClass(data.summary.system.loadPercentage, 90, 70)}">\${data.summary.system.status}</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Carga do Sistema:</span>
                      <span class="stat-value \${getColorClass(data.summary.system.loadPercentage, 90, 70)}">\${data.summary.system.loadPercentage}%</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Capacidade:</span>
                      <span class="stat-value">\${data.summary.system.capacity} jobs</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Tempo Estimado de Espera:</span>
                      <span class="stat-value \${getColorClass(data.summary.system.estimatedWaitTime, 30, 10)}">\${data.summary.system.estimatedWaitTime} segundos</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Total em Processamento:</span>
                      <span class="stat-value \${getColorClass(data.summary.totals.processingNow, 30, 15)}">\${data.summary.totals.processingNow}</span>
                    </div>
                  \`;
                  statsContainer.appendChild(summaryCard);
                  
                  // Adicionar cards para cada fila
                  Object.entries(data.queueDetails).forEach(([queueName, queueStats]) => {
                    const card = document.createElement('div');
                    card.className = 'queue-card';
                    
                    card.innerHTML = \`
                      <h2>Fila: \${queueName}</h2>
                      <div class="stat-row">
                        <span class="stat-label">Em espera:</span>
                        <span class="stat-value \${getColorClass(queueStats.waiting, 10, 5)}">\${queueStats.waiting}</span>
                      </div>
                      <div class="stat-row">
                        <span class="stat-label">Ativos:</span>
                        <span class="stat-value \${getColorClass(queueStats.active, 30, 15)}">\${queueStats.active}</span>
                      </div>
                      <div class="stat-row">
                        <span class="stat-label">Concluídos:</span>
                        <span class="stat-value">\${queueStats.completed}</span>
                      </div>
                      <div class="stat-row">
                        <span class="stat-label">Falhas:</span>
                        <span class="stat-value \${getColorClass(queueStats.failed, 1, 0)}">\${queueStats.failed}</span>
                      </div>
                      <div class="stat-row">
                        <span class="stat-label">Atrasados:</span>
                        <span class="stat-value \${getColorClass(queueStats.delayed, 10, 5)}">\${queueStats.delayed}</span>
                      </div>
                      <div class="stat-row">
                        <span class="stat-label">Processando agora:</span>
                        <span class="stat-value \${getColorClass(queueStats.processingNow, 30, 15)}">\${queueStats.processingNow}</span>
                      </div>
                    \`;
                    
                    statsContainer.appendChild(card);
                  });
                  
                  // Atualizar informações do servidor
                  serverInfo.innerHTML = \`
                    <h3>Informações do Sistema</h3>
                    <div class="stat-row">
                      <span class="stat-label">Total de Filas:</span>
                      <span class="stat-value">\${data.summary.queues}</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Total em Espera:</span>
                      <span class="stat-value \${getColorClass(data.summary.totals.waiting, 20, 10)}">\${data.summary.totals.waiting}</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Total Ativos:</span>
                      <span class="stat-value \${getColorClass(data.summary.totals.active, 40, 20)}">\${data.summary.totals.active}</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Total Concluídos:</span>
                      <span class="stat-value">\${data.summary.totals.completed}</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Total Falhas:</span>
                      <span class="stat-value \${getColorClass(data.summary.totals.failed, 5, 1)}">\${data.summary.totals.failed}</span>
                    </div>
                  \`;
                  
                } else {
                  alert('Erro ao atualizar estatísticas: ' + (data.error || 'Erro desconhecido'));
                }
              })
              .catch(error => {
                console.error('Erro ao buscar estatísticas:', error);
                alert('Erro ao buscar estatísticas. Veja o console para detalhes.');
              })
              .finally(() => {
                loading.style.display = 'none';
              });
          }
          
          // Carregar estatísticas iniciais
          document.addEventListener('DOMContentLoaded', refreshStats);
          
          // Atualizar automaticamente a cada 30 segundos
          setInterval(refreshStats, 30000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro ao renderizar dashboard:', error);
    res.status(500).send('Erro ao carregar dashboard');
  }
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Rota direta para compatibilidade com WordPress
app.post('/api/diagnostic-pdf', async (req, res) => {
  console.log('Requisição recebida na rota compatível com WordPress');
  await formController.processFormData(req, res);
});

// Rotas do microserviço
app.use('/api/charts', chartRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/queue', queueRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware para tratamento de erros
app.use(errorHandler);

// Configurar processadores de fila
import { setupQueueProcessors } from './services/queue-processors';
setupQueueProcessors(queueService);

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
});

// Tratamento de desligamento do processo
process.on('SIGTERM', async () => {
  console.log('Recebido sinal SIGTERM, encerrando...');
  await queueService.closeAll();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Recebido sinal SIGINT, encerrando...');
  await queueService.closeAll();
  process.exit(0);
});

// Iniciar o servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Microserviço de exportação de PDF rodando na porta ${PORT}`);
  console.log(`Ambiente: ${config.nodeEnv}`);
  console.log(`CORS: ${config.corsOptions.origin === '*' ? 'Permitindo todas as origens' : 'Origins restritos'}`);
  console.log('Rotas disponíveis:');
  console.log('- /health (GET)');
  console.log('- /api/diagnostic-pdf (POST)');
  console.log('- /api/forms/diagnostic-pdf (POST)');
  console.log('- /api/forms/variations (POST)');
  console.log('- /api/charts/* (vários endpoints)');
  console.log('- /api/queue/* (monitoramento de filas)');
}); 