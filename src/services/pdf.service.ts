import PDFDocument from 'pdfkit';
import { Canvas, createCanvas } from 'canvas';
import { ChartService } from './chart.service';
import { RadarChartData, PdfOptions } from '../interfaces/chart.interface';
import { Readable } from 'stream';

export class PdfService {
  private chartService: ChartService;

  constructor() {
    this.chartService = new ChartService();
  }

  /**
   * Gera um PDF contendo o gráfico radar
   * @param chartData Dados para o gráfico radar
   * @param options Opções de configuração do PDF
   * @returns Stream legível contendo o PDF gerado
   */
  public async generatePdf(chartData: RadarChartData, options: PdfOptions = {}): Promise<Readable> {
    // Configurações padrão
    const width = chartData.width || 600;
    const height = chartData.height || 400;
    const pageSize = options.pageSize || 'A4';
    const pageOrientation = options.pageOrientation || 'portrait';
    
    // Criar o canvas e gerar o gráfico
    const canvas = createCanvas(width, height);
    const chart = this.chartService.generateRadarChart(canvas, chartData);
    
    // Garantir que o gráfico seja renderizado
    await new Promise<void>(resolve => setTimeout(resolve, 100));
    
    // Criar o documento PDF
    const doc = new PDFDocument({ 
      size: pageSize, 
      layout: pageOrientation,
      info: {
        Title: options.title || 'Gráfico Radar',
        Author: options.author || 'Microserviço PDF Export',
        Subject: options.subject || 'Gráfico Radar em PDF'
      }
    });
    
    // Adicionar título ao PDF, se fornecido
    if (options.title) {
      doc.fontSize(18)
        .font('Helvetica-Bold')
        .text(options.title, { align: 'center' })
        .moveDown(0.5);
    }
    
    // Centralizar o gráfico na página
    const pageWidth = pageOrientation === 'portrait' ? 
      (pageSize === 'A4' ? 595.28 : 612) : 
      (pageSize === 'A4' ? 841.89 : 792);
    
    const xPosition = (pageWidth - width) / 2;
    
    // Adicionar imagem do gráfico ao PDF
    doc.image(canvas.toBuffer('image/png'), xPosition, doc.y, {
      width,
      height
    });
    
    // Finalizar o documento
    doc.end();
    
    // Implementação correta do stream Readable
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const stream = new Readable({
          read() {
            this.push(buffer);
            this.push(null); // Sinaliza o fim do stream
          }
        });
        
        resolve(stream);
      });
    });
  }
} 