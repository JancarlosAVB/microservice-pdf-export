import { Request, Response } from 'express';
import { PdfService } from '../services/pdf.service';
import { ChartRequest } from '../interfaces/chart.interface';

export class ChartController {
  private pdfService: PdfService;

  constructor() {
    this.pdfService = new PdfService();
  }

  /**
   * Gera um arquivo PDF com gráfico radar
   * @param req Requisição Express
   * @param res Resposta Express
   */
  public async generateRadarChartPdf(req: Request, res: Response): Promise<void> {
    try {
      const { chartData, pdfOptions } = req.body as ChartRequest;
      
      // Validar se os dados do gráfico foram fornecidos
      if (!chartData || !chartData.labels || !chartData.datasets || chartData.datasets.length === 0) {
        res.status(400).json({ 
          success: false, 
          message: 'Dados do gráfico inválidos. Verifique se você forneceu labels e datasets.' 
        });
        return;
      }
      
      // Validar se os datasets têm dados
      const invalidDataset = chartData.datasets.some(ds => !ds.data || ds.data.length === 0);
      if (invalidDataset) {
        res.status(400).json({ 
          success: false, 
          message: 'Todos os datasets devem conter dados válidos.' 
        });
        return;
      }
      
      // Gerar o PDF
      const pdfStream = await this.pdfService.generatePdf(chartData, pdfOptions);
      
      // Configurar headers para download do PDF
      const fileName = pdfOptions?.fileName || 'radar-chart.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      // Enviar o PDF como resposta
      pdfStream.pipe(res);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      
      // Verificar se a resposta já foi enviada
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao gerar o PDF',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  }
} 