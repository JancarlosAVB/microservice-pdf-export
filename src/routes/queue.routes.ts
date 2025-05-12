import { Router } from 'express';
import { QueueService, QueueType } from '../services/queue.service';

const router = Router();
const queueService = QueueService.getInstance();

// Rota para obter estatísticas de todas as filas
router.get('/stats', async (req, res) => {
  try {
    const stats = await queueService.getStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas das filas:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao obter estatísticas das filas',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Handler para limpar trabalhos em espera de uma fila específica
const cleanJobs = async (req: any, res: any) => {
  try {
    const { queueName } = req.params;
    const queue = queueService.getQueue(queueName as any);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: `Fila '${queueName}' não encontrada`
      });
    }
    
    await queue.empty();
    
    return res.json({
      success: true,
      message: `Trabalhos em espera na fila '${queueName}' removidos`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erro ao limpar fila '${req.params.queueName}':`, error);
    return res.status(500).json({
      success: false,
      error: `Falha ao limpar fila '${req.params.queueName}'`,
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Handler para obter detalhes de um job específico
const getJobDetails = async (req: any, res: any) => {
  try {
    const { queueName, jobId } = req.params;
    const queue = queueService.getQueue(queueName as any);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: `Fila '${queueName}' não encontrada`
      });
    }
    
    const job = await queue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: `Job '${jobId}' não encontrado na fila '${queueName}'`
      });
    }
    
    // Obtém detalhes do job
    const state = await job.getState();
    
    return res.json({
      success: true,
      data: {
        id: job.id,
        state,
        data: job.data,
        progress: job.progress(),
        returnvalue: job.returnvalue,
        attempts: job.attemptsMade,
        timestamp: {
          created: job.timestamp,
          processed: job.processedOn,
          finished: job.finishedOn
        }
      }
    });
  } catch (error) {
    console.error(`Erro ao obter job '${req.params.jobId}':`, error);
    return res.status(500).json({
      success: false,
      error: `Falha ao obter job '${req.params.jobId}'`,
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Aplicar os handlers às rotas
router.delete('/:queueName/jobs/waiting', cleanJobs);
router.get('/:queueName/jobs/:jobId', getJobDetails);

export default router; 