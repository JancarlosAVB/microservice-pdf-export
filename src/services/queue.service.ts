import Bull, { Queue, JobOptions } from 'bull';
import { config } from '../config';

// Tipos de filas
export enum QueueType {
  PDF_GENERATION = 'pdf-generation',
  CHART_GENERATION = 'chart-generation',
}

// Opções padrão para os jobs
const defaultJobOptions: JobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

// Classe para gerenciar filas
export class QueueService {
  private static instance: QueueService;
  private queues: Map<string, Queue> = new Map();

  private constructor() {
    // Inicializar as filas
    Object.values(QueueType).forEach((queueName) => {
      this.createQueue(queueName);
    });
  }

  // Singleton pattern
  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
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

    const mergedOptions = { ...defaultJobOptions, ...options };
    const job = await queue.add(data, mergedOptions);
    
    console.log(`Job ${job.id} adicionado à fila "${queueName}"`);
    return job;
  }

  // Processar jobs da fila
  public processQueue<T, R>(
    queueName: QueueType,
    processor: (job: Bull.Job<T>) => Promise<R>
  ): void {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Fila "${queueName}" não encontrada`);
    }

    queue.process(config.queue.concurrency, processor);
    console.log(`Processador configurado para a fila "${queueName}" com concorrência ${config.queue.concurrency}`);
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
      };
    }
    
    return stats;
  }
} 