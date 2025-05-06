import express from 'express';
import cors from 'cors';
import { config } from './config';
import chartRoutes from './routes/chart.routes';
import { errorHandler, notFoundHandler } from './utils/error-handler';

// Inicializar o aplicativo Express
const app = express();

// Middleware
app.use(cors(config.corsOptions));
app.use(express.json({ limit: '10mb' })); // Aumentar limite para permitir envio de dados maiores

// Logs de requisição simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Rotas do microserviço
app.use('/api', chartRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware para tratamento de erros
app.use(errorHandler);

// Iniciar o servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Microserviço de exportação de PDF rodando na porta ${PORT}`);
  console.log(`Ambiente: ${config.nodeEnv}`);
}); 