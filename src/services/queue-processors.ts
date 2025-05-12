import { QueueService, QueueType } from './queue.service';
import { FormController } from '../controllers/form.controller';
import { ChartController } from '../controllers/chart.controller';
import Bull from 'bull';
import fs from 'fs';
import path from 'path';

export function setupQueueProcessors(queueService: QueueService): void {
  const formController = new FormController();
  const chartController = new ChartController();

  // Processador para geração de PDFs
  queueService.processQueue<any, any>(QueueType.PDF_GENERATION, async (job) => {
    console.log(`[PDF_GENERATION] Processando job ${job.id}`);
    try {
      // Atualiza o progresso
      await job.progress(10);

      const { formData, iaChartData, culturaChartData, pdfOptions, callbackUrl } = job.data;
      
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

      await job.progress(80);

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

      await job.progress(100);
      
      return {
        success: true,
        filePath,
        fileName,
        fileSize: pdfResult.length,
        message: 'PDF gerado com sucesso'
      };
    } catch (error) {
      console.error(`[PDF_GENERATION] Erro ao processar job ${job.id}:`, error);
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