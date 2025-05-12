import express from 'express';
import cors from 'cors';
import { config } from './config';
import chartRoutes from './routes/chart.routes';
import formRoutes from './routes/form.routes';
import { errorHandler, notFoundHandler } from './utils/error-handler';
import { FormController } from './controllers/form.controller';
import { QueueService, QueueType } from './services/queue.service';
import queueRoutes from './routes/queue.routes';

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