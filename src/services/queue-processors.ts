import { QueueService, QueueType } from './queue.service';
import { FormController } from '../controllers/form.controller';
import { ChartController } from '../controllers/chart.controller';
import Bull from 'bull';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export function setupQueueProcessors(queueService: QueueService): void {
  const formController = new FormController();
  const chartController = new ChartController();

  // Processador para geração de PDFs
  queueService.processQueue<any, any>(QueueType.PDF_GENERATION, async (job) => {
    console.log(`[PDF_GENERATION] Processando job ${job.id}`);
    try {
      // Atualiza o progresso
      await job.progress(10);
      
      // Enviar atualização de progresso para callback se disponível
      const { formData, iaChartData, culturaChartData, pdfOptions, callbackUrl, statusUpdateUrl } = job.data;
      
      // Se existir URL para atualizações de status, notificar início (10%)
      if (statusUpdateUrl) {
        try {
          await axios.post(statusUpdateUrl, {
            jobId: job.id,
            progress: 10,
            status: 'processing',
            message: 'Iniciando processamento do PDF'
          });
          console.log(`Atualização de status enviada para ${statusUpdateUrl}: 10%`);
        } catch (error) {
          console.error(`Erro ao enviar atualização de status para ${statusUpdateUrl}:`, error);
        }
      }
      
      // Aqui seria feito o processamento do PDF de forma similar ao que é feito no controller
      // Simulando a requisição e resposta
      const req = {
        body: {
          formData,
          iaChartData,
          culturaChartData,
          pdfOptions
        },
        path: '/api/diagnostic-pdf'
      } as any;

      const pdfResult = await new Promise<Buffer>((resolve, reject) => {
        // Objeto resposta personalizado para capturar o buffer do PDF
        const res = {
          status: (statusCode: number) => {
            return {
              json: (data: any) => {
                if (statusCode !== 200) {
                  reject(new Error(data.error || 'Erro ao gerar PDF'));
                }
              },
              send: (data: Buffer) => {
                resolve(data);
              }
            };
          },
          setHeader: () => {},
        } as any;

        formController.processFormData(req, res)
          .catch(reject);
      });

      // Atualizar progresso e notificar (50%)
      await job.progress(50);
      if (statusUpdateUrl) {
        try {
          await axios.post(statusUpdateUrl, {
            jobId: job.id,
            progress: 50,
            status: 'processing',
            message: 'Gerando gráficos e conteúdo do PDF'
          });
          console.log(`Atualização de status enviada para ${statusUpdateUrl}: 50%`);
        } catch (error) {
          console.error(`Erro ao enviar atualização de status para ${statusUpdateUrl}:`, error);
        }
      }

      // Atualizar progresso e notificar (80%)
      await job.progress(80);
      if (statusUpdateUrl) {
        try {
          await axios.post(statusUpdateUrl, {
            jobId: job.id,
            progress: 80,
            status: 'processing',
            message: 'Finalizando PDF'
          });
          console.log(`Atualização de status enviada para ${statusUpdateUrl}: 80%`);
        } catch (error) {
          console.error(`Erro ao enviar atualização de status para ${statusUpdateUrl}:`, error);
        }
      }

      // Se houver uma URL de callback, enviar o PDF para ela
      if (callbackUrl) {
        // Implementar envio para callbackUrl se necessário
        console.log(`Enviando PDF para callback URL: ${callbackUrl}`);
        // Aqui implementaria-se o código para envio
      }

      // Salvar o PDF em disco para acesso posterior, se necessário
      const fileName = pdfOptions?.fileName || `diagnostico-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../../tmp', fileName);
      
      // Garantir que o diretório tmp existe
      if (!fs.existsSync(path.join(__dirname, '../../tmp'))) {
        fs.mkdirSync(path.join(__dirname, '../../tmp'), { recursive: true });
      }
      
      fs.writeFileSync(filePath, pdfResult);

      // Atualizar progresso para 100% e notificar conclusão
      await job.progress(100);
      if (statusUpdateUrl) {
        try {
          await axios.post(statusUpdateUrl, {
            jobId: job.id,
            progress: 100,
            status: 'completed',
            message: 'PDF gerado com sucesso',
            filePath,
            fileName
          });
          console.log(`Atualização de status enviada para ${statusUpdateUrl}: 100%`);
        } catch (error) {
          console.error(`Erro ao enviar atualização de status para ${statusUpdateUrl}:`, error);
        }
      }
      
      return {
        success: true,
        filePath,
        fileName,
        fileSize: pdfResult.length,
        message: 'PDF gerado com sucesso'
      };
    } catch (error) {
      console.error(`[PDF_GENERATION] Erro ao processar job ${job.id}:`, error);
      
      // Notificar erro
      if (job.data.statusUpdateUrl) {
        try {
          await axios.post(job.data.statusUpdateUrl, {
            jobId: job.id,
            progress: 0,
            status: 'failed',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
          });
          console.log(`Atualização de erro enviada para ${job.data.statusUpdateUrl}`);
        } catch (callbackError) {
          console.error(`Erro ao enviar atualização de erro para ${job.data.statusUpdateUrl}:`, callbackError);
        }
      }
      
      throw error;
    }
  });

  // Processador para geração de gráficos
  queueService.processQueue<any, any>(QueueType.CHART_GENERATION, async (job) => {
    console.log(`[CHART_GENERATION] Processando job ${job.id}`);
    try {
      await job.progress(10);

      const { chartData, chartOptions } = job.data;
      
      // Simular a requisição e resposta
      const req = {
        body: {
          chartData,
          chartOptions
        }
      } as any;

      const chartResult = await new Promise<Buffer>((resolve, reject) => {
        const res = {
          status: (statusCode: number) => {
            return {
              json: (data: any) => {
                if (statusCode !== 200) {
                  reject(new Error(data.error || 'Erro ao gerar gráfico'));
                }
              },
              send: (data: Buffer) => {
                resolve(data);
              }
            };
          },
          setHeader: () => {},
        } as any;

        chartController.generateRadarChartPdf(req, res)
          .catch(reject);
      });

      await job.progress(100);
      
      return {
        success: true,
        chartImage: chartResult.toString('base64'),
        message: 'Gráfico gerado com sucesso'
      };
    } catch (error) {
      console.error(`[CHART_GENERATION] Erro ao processar job ${job.id}:`, error);
      throw error;
    }
  });

  console.log('Processadores de fila configurados');
} 