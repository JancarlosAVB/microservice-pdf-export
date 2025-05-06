import { Request, Response } from 'express';
import { PdfService } from '../services/pdf.service';
import { ChartRequest, DiagnosticChartRequest } from '../interfaces/chart.interface';

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

  /**
   * Gera um arquivo PDF de diagnóstico completo com dois gráficos radar (IA e Cultura)
   * e informações detalhadas de análise e recomendações
   * @param req Requisição Express
   * @param res Resposta Express
   */
  public async generateDiagnosticPdf(req: Request, res: Response): Promise<void> {
    try {
      const { iaChartData, culturaChartData, pdfOptions } = req.body as DiagnosticChartRequest;
      
      // Validar se os dados dos gráficos foram fornecidos
      if (!iaChartData || !iaChartData.labels || !iaChartData.datasets || iaChartData.datasets.length === 0) {
        res.status(400).json({ 
          success: false, 
          message: 'Dados do gráfico de IA inválidos. Verifique se você forneceu labels e datasets.' 
        });
        return;
      }

      if (!culturaChartData || !culturaChartData.labels || !culturaChartData.datasets || culturaChartData.datasets.length === 0) {
        res.status(400).json({ 
          success: false, 
          message: 'Dados do gráfico de Cultura inválidos. Verifique se você forneceu labels e datasets.' 
        });
        return;
      }
      
      // Validar se os datasets têm dados
      const invalidIADataset = iaChartData.datasets.some(ds => !ds.data || ds.data.length === 0);
      if (invalidIADataset) {
        res.status(400).json({ 
          success: false, 
          message: 'Todos os datasets do gráfico de IA devem conter dados válidos.' 
        });
        return;
      }

      const invalidCulturaDataset = culturaChartData.datasets.some(ds => !ds.data || ds.data.length === 0);
      if (invalidCulturaDataset) {
        res.status(400).json({ 
          success: false, 
          message: 'Todos os datasets do gráfico de Cultura devem conter dados válidos.' 
        });
        return;
      }
      
      // Gerar o PDF de diagnóstico
      const pdfStream = await this.pdfService.generateDiagnosticPdf(iaChartData, culturaChartData, pdfOptions);
      
      // Configurar headers para download do PDF
      const fileName = pdfOptions?.fileName || 'diagnostico-ia-cultura.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      // Enviar o PDF como resposta
      pdfStream.pipe(res);
    } catch (error) {
      console.error('Erro ao gerar PDF de diagnóstico:', error);
      
      // Verificar se a resposta já foi enviada
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao gerar o PDF de diagnóstico',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  }
}