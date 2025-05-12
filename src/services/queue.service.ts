import Bull, { Queue, JobOptions } from 'bull';
import { config } from '../config';

// Tipos de filas
export enum QueueType {
  PDF_GENERATION = 'pdf-generation',
  CHART_GENERATION = 'chart-generation',
}

// Opções padrão para os jobs
const defaultJobOptions: JobOptions = {
  attempts: 10,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: true,
  removeOnFail: false,
  // Adicionar atraso inicial para todas as requisições
  delay: 5000, // 5 segundos de atraso antes de iniciar o processamento
};

// Classe para gerenciar filas
export class QueueService {
  private static instance: QueueService;
  private queues: Map<string, Queue> = new Map();
  private processingJobs: number = 0;

  private constructor() {
    // Inicializar as filas
    Object.values(QueueType).forEach((queueName) => {
      this.createQueue(queueName);
    });
    
    // Configurar eventos para monitorar jobs ativos
    this.setupQueueEvents();
  }

  // Singleton pattern
  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  // Configurar eventos para monitorar fila
  private setupQueueEvents(): void {
    Object.values(QueueType).forEach((queueName) => {
      const queue = this.queues.get(queueName);
      if (queue) {
        // Monitorar jobs ativos
        queue.on('active', (job) => {
          this.processingJobs++;
          console.log(`Job ${job.id} ativo. Total de jobs processando: ${this.processingJobs}`);
        });

        // Monitorar jobs completos
        queue.on('completed', (job) => {
          this.processingJobs = Math.max(0, this.processingJobs - 1);
          console.log(`Job ${job.id} concluído. Total de jobs processando: ${this.processingJobs}`);
        });

        // Monitorar jobs com falha
        queue.on('failed', (job, error) => {
          this.processingJobs = Math.max(0, this.processingJobs - 1);
          console.log(`Job ${job.id} falhou: ${error.message}. Total de jobs processando: ${this.processingJobs}`);
        });
      }
    });
  }

  // Criar uma nova fila
  private createQueue(queueName: string): Queue {
    const queue = new Bull(queueName, {
      redis: config.redis,
      limiter: {
        max: config.queue.limiterMax,
        duration: config.queue.limiterDuration,
      },
      defaultJobOptions,
    });

    this.queues.set(queueName, queue);
    console.log(`Fila "${queueName}" inicializada`);
    return queue;
  }

  // Adicionar um job à fila
  public async addJob<T>(
    queueName: QueueType,
    data: T,
    options: JobOptions = {}
  ): Promise<Bull.Job<T>> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Fila "${queueName}" não encontrada`);
    }

    // Calcular atraso baseado na carga atual do sistema
    const waitingCount = await queue.getWaitingCount();
    const activeCount = await queue.getActiveCount();
    const totalJobs = waitingCount + activeCount;
    
    // Atraso proporcional à quantidade de jobs na fila, com um mínimo de 3 segundos
    const dynamicDelay = Math.max(
      5000, // Mínimo de 5 segundos (aumentado para servidor com 8GB RAM)
      totalJobs * config.queue.delayBetweenJobs * 2 // Duplicando o fator de multiplicação
    );

    const mergedOptions = { 
      ...defaultJobOptions,
      ...options,
      delay: options.delay || dynamicDelay
    };
    
    const job = await queue.add(data, mergedOptions);
    
    console.log(`Job ${job.id} adicionado à fila "${queueName}" com ${totalJobs} jobs na fila. Atraso: ${mergedOptions.delay}ms`);
    
    return job;
  }

  // Processar jobs da fila com atraso entre processamentos
  public processQueue<T, R>(
    queueName: QueueType,
    processor: (job: Bull.Job<T>) => Promise<R>
  ): void {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Fila "${queueName}" não encontrada`);
    }

    // Wrapper para adicionar atraso entre processamentos
    const processorWithThrottle = async (job: Bull.Job<T>): Promise<R> => {
      try {
        const result = await processor(job);
        
        // Adicionar um pequeno atraso após processar cada job
        if (config.queue.delayBetweenJobs > 0) {
          await new Promise(resolve => setTimeout(resolve, config.queue.delayBetweenJobs));
        }
        
        return result;
      } catch (error) {
        console.error(`Erro ao processar job ${job.id}:`, error);
        throw error;
      }
    };

    queue.process(config.queue.concurrency, processorWithThrottle);
    console.log(`Processador configurado para a fila "${queueName}" com concorrência ${config.queue.concurrency} e atraso de ${config.queue.delayBetweenJobs}ms entre jobs`);
  }

  // Obter uma fila específica
  public getQueue(queueName: QueueType): Queue | undefined {
    return this.queues.get(queueName);
  }

  // Fechar todas as filas
  public async closeAll(): Promise<void> {
    const promises = Array.from(this.queues.values()).map((queue) => queue.close());
    await Promise.all(promises);
    console.log('Todas as filas foram fechadas');
  }

  // Método para obter estatísticas de todas as filas
  public async getStats(): Promise<any> {
    const stats: Record<string, any> = {};
    
    for (const [name, queue] of this.queues.entries()) {
      stats[name] = {
        waiting: await queue.getWaitingCount(),
        active: await queue.getActiveCount(),
        completed: await queue.getCompletedCount(),
        failed: await queue.getFailedCount(),
        delayed: await queue.getDelayedCount(),
        processingNow: this.processingJobs
      };
    }
    
    return stats;
  }
} 