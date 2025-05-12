import { Router } from 'express';
import { QueueService, QueueType } from '../services/queue.service';
import { config } from '../config';

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

// Rota para obter um resumo mais simples de estatísticas para o painel
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await queueService.getStats();
    
    // Calcular estatísticas agregadas
    const totalWaiting = Object.values(stats).reduce((sum: number, queue: any) => sum + (queue.waiting || 0), 0);
    const totalActive = Object.values(stats).reduce((sum: number, queue: any) => sum + (queue.active || 0), 0);
    const totalCompleted = Object.values(stats).reduce((sum: number, queue: any) => sum + (queue.completed || 0), 0);
    const totalFailed = Object.values(stats).reduce((sum: number, queue: any) => sum + (queue.failed || 0), 0);
    const totalDelayed = Object.values(stats).reduce((sum: number, queue: any) => sum + (queue.delayed || 0), 0);
    
    // Total de processamento em andamento
    const processingNow = Object.values(stats).reduce((sum: number, queue: any) => sum + (queue.processingNow || 0), 0);
    
    // Capacidade do sistema
    const systemCapacity = config.queue.concurrency;
    const loadPercentage = Math.round((processingNow / systemCapacity) * 100);
    
    // Status do sistema
    let systemStatus = 'normal';
    if (loadPercentage > 90) systemStatus = 'crítico';
    else if (loadPercentage > 70) systemStatus = 'alto';
    else if (loadPercentage > 40) systemStatus = 'moderado';
    
    // Estimativa de tempo de espera
    const estimatedWaitTime = totalWaiting > 0 
      ? Math.round((totalWaiting / systemCapacity) * config.queue.delayBetweenJobs / 1000)
      : 0;
    
    res.json({
      success: true,
      summary: {
        queues: Object.keys(stats).length,
        system: {
          status: systemStatus,
          loadPercentage,
          capacity: systemCapacity,
          estimatedWaitTime
        },
        totals: {
          waiting: totalWaiting,
          active: totalActive,
          completed: totalCompleted,
          failed: totalFailed,
          delayed: totalDelayed,
          processingNow
        }
      },
      queueDetails: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter resumo de estatísticas das filas:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao obter resumo de estatísticas',
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