import PDFDocument from 'pdfkit';
import { Canvas, createCanvas } from 'canvas';
import { ChartService } from './chart.service';
import { RadarChartData, PdfOptions, ChartDataset } from '../interfaces/chart.interface';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { FormService } from './form.service';
import { recommendationsData } from '../data/recommendations.data';

export class PdfService {
  private chartService: ChartService;
  private assetsPath: string;
  private fontRegular: string;
  private fontBold: string;
  
  // Cores padrão para o PDF
  private colors = {
    primary: '#40528d',      // Azul escuro para títulos principais
    secondary: '#808080',    // Cinza para subtítulos e textos secundários
    dark: '#000000',         // Preto para textos de destaque
    white: '#FFFFFF',        // Branco para textos sobre fundos escuros
    iconBg: '#cad64a',       // Verde para fundo dos ícones
    iconColor: '#40528d'     // Azul para os ícones
  };
  
  // Mapeamento de texto diagnóstico para combinações de IA e Cultura
  private diagnosticMapping: Record<string, string> = {
    'Tradicional/Alta Resistência': 'Sua organização está em um estágio inicial de maturidade em IA, com desafios significativos na cultura de inovação.',
    'Tradicional/Moderadamente Aberta': 'Há potencial para crescimento, mas é necessário investir tanto em tecnologia quanto em cultura de inovação.',
    'Tradicional/Favorável': 'Apesar do uso limitado de IA, sua cultura organizacional é receptiva a mudanças.',
    'Tradicional/Altamente Alinhada': 'Sua cultura é excelente, mas a adoção de IA precisa ser acelerada.',
    
    'Exploradora/Alta Resistência': 'Iniciativas pontuais de IA enfrentam barreiras culturais significativas.',
    'Exploradora/Moderadamente Aberta': 'Começando a explorar IA com cautela, com espaço para desenvolvimento cultural.',
    'Exploradora/Favorável': 'Bom equilíbrio entre exploração de IA e abertura cultural.',
    'Exploradora/Altamente Alinhada': 'Potencial significativo para expansão de iniciativas de IA.',
    
    'Inovadora/Alta Resistência': 'Adoção estruturada de IA encontra resistência cultural.',
    'Inovadora/Moderadamente Aberta': 'IA bem implementada, mas com necessidade de alinhamento cultural.',
    'Inovadora/Favorável': 'Forte implementação de IA com cultura de inovação positiva.',
    'Inovadora/Altamente Alinhada': 'Excelente integração de IA com cultura organizacional inovadora.',
    
    'Visionária/Alta Resistência': 'IA estrategicamente integrada, mas com urgente necessidade de transformação cultural.',
    'Visionária/Moderadamente Aberta': 'Estratégia de IA avançada, com potencial para maior alinhamento cultural.',
    'Visionária/Favorável': 'Modelo de excelência em implementação de IA e cultura de inovação.',
    'Visionária/Altamente Alinhada': 'Referência em maturidade de IA e cultura organizacional inovadora.'
  };

  constructor() {
    this.chartService = new ChartService();
    // Caminho para os assets (imagens, fontes, etc.)
    this.assetsPath = path.join(process.cwd(), 'assets');
    
    // Definir caminhos das fontes
    this.fontRegular = path.join(this.assetsPath, 'fonts', 'Asap-Regular.ttf');
    this.fontBold = path.join(this.assetsPath, 'fonts', 'Asap-Bold.ttf');
    
    // Criar diretório de fontes se não existir
    const fontsDir = path.join(this.assetsPath, 'fonts');
    if (!fs.existsSync(fontsDir)) {
      fs.mkdirSync(fontsDir, { recursive: true });
    }
  }

  /**
   * Registra as fontes no PDFDocument
   * @param doc Documento PDF
   */
  private registerFonts(doc: any): void {
    // Verificar se os arquivos de fonte existem
    if (fs.existsSync(this.fontRegular)) {
      doc.registerFont('AsapRegular', this.fontRegular);
    } else {
      console.warn('Fonte Asap Regular não encontrada. Usando Helvetica como fallback.');
    }
    
    if (fs.existsSync(this.fontBold)) {
      doc.registerFont('AsapBold', this.fontBold);
    } else {
      console.warn('Fonte Asap Bold não encontrada. Usando Helvetica-Bold como fallback.');
    }
  }

  /**
   * Obtém o nome da fonte regular com fallback
   */
  private getFontRegular(): string {
    return fs.existsSync(this.fontRegular) ? 'AsapRegular' : 'Helvetica';
  }

  /**
   * Obtém o nome da fonte bold com fallback
   */
  private getFontBold(): string {
    return fs.existsSync(this.fontBold) ? 'AsapBold' : 'Helvetica-Bold';
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
      
      doc.on('data', (chunk: Buffer) => {
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

  /**
   * Gera um PDF completo de diagnóstico contendo dois gráficos radar e análises
   * @param iaChartData Dados para o gráfico radar de IA
   * @param culturaChartData Dados para o gráfico radar de Cultura
   * @param options Opções de configuração do PDF e diagnóstico
   * @returns Stream legível contendo o PDF gerado
   */
  public async generateDiagnosticPdf(
    iaChartData: RadarChartData, 
    culturaChartData: RadarChartData, 
    options: PdfOptions = {}
  ): Promise<Readable> {
    // Configurações padrão
    const pageSize = options.pageSize || 'A4';
    const pageOrientation = options.pageOrientation || 'portrait';
    
    // Definir tamanho EXATO para ambos os gráficos - mesmo tamanho garantido
    const chartSize = 300; // Tamanho fixo para ambos os gráficos
    
    // Garantir que a análise combinada seja sempre pulada, evitando textos duplicados
    options.skipCombinedAnalysis = true;
    
    // Criar os canvas com EXATAMENTE o mesmo tamanho
    const iaCanvas = createCanvas(chartSize, chartSize);
    const culturaCanvas = createCanvas(chartSize, chartSize);
    
    // Garantir que os dados não sejam zerados
    const iaDatasets = iaChartData.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.map(value => value || 1) // Substituir zeros por valores mínimos
    }));
    
    const culturaDatasets = culturaChartData.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.map(value => value || 1) // Substituir zeros por valores mínimos
    }));

    // Aplicar títulos para cada gráfico - removendo títulos dos gráficos para ficar igual à imagem
    this.chartService.generateRadarChart(iaCanvas, {
      ...iaChartData,
      title: '',  // Sem título no gráfico, será adicionado como texto no PDF
      datasets: iaDatasets,
      width: chartSize,
      height: chartSize
    });
    
    this.chartService.generateRadarChart(culturaCanvas, {
      ...culturaChartData,
      title: '',  // Sem título no gráfico, será adicionado como texto no PDF
      datasets: culturaDatasets,
      width: chartSize,
      height: chartSize
    });
    
    // Garantir que os gráficos sejam renderizados (aumentando o tempo para garantir renderização completa)
    await new Promise<void>(resolve => setTimeout(resolve, 300));
    
    // Criar o documento PDF com margens menores
    const doc = new PDFDocument({ 
      size: pageSize, 
      layout: pageOrientation,
      margins: { top: 60, bottom: 60, left: 60, right: 60 },  // Margens ajustadas em todos os lados
      info: {
        Title: options.title || 'Diagnóstico de IA e Cultura',
        Author: options.author || 'Singulari - Diagnóstico de IA',
        Subject: options.subject || 'Relatório de Diagnóstico',
        Keywords: options.keywords || 'IA, Cultura, Diagnóstico',
        CreationDate: new Date(),
      }
    });
    
    // Registrar as fontes
    this.registerFonts(doc);
    
    // Cabeçalho azul escuro para a primeira página
    doc.rect(0, 0, doc.page.width, 50)
       .fill('#1E2A4A');  // Azul escuro no topo da página
    
    // Texto do cabeçalho
    doc.fillColor(this.colors.white)
       .fontSize(14)
       .font(this.getFontBold())
       .text('Diagnóstico | Relatório Completo', 50, 18, { align: 'left' });
    
    // Configurar cabeçalho para as próximas páginas
    doc.on('pageAdded', () => {
      doc.rect(0, 0, doc.page.width, 50)
         .fill('#1E2A4A');
      doc.fillColor(this.colors.white)
         .fontSize(14)
         .font(this.getFontBold())
         .text('Diagnóstico | Relatório Completo', 50, 18, { align: 'left' });
    });
       
    // Título principal 'Seu resultado' centralizado - com espaço adequado do cabeçalho
    doc.fontSize(28)
       .font(this.getFontBold())
       .fillColor(this.colors.primary)  // Cor primária (azul escuro)
       .text('Seu resultado', 40, 100, { width: doc.page.width - 80, align: 'center' })
       .moveDown(1);
       
    // Calcular pontuações e níveis
    // Somar os valores dos datasets para obter a pontuação total
    const iaValues = iaChartData.datasets[0].data;
    const culturaValues = culturaChartData.datasets[0].data;
    
    // Calcular as pontuações (soma dos valores)
    const iaScore = iaValues.reduce((sum, val) => sum + (val || 0), 0);
    const culturaScore = culturaValues.reduce((sum, val) => sum + (val || 0), 0);
    
    // Determinar os níveis com base nas pontuações
    const iaLevel = this.calculateMaturityLevel(iaScore);
    const culturaLevel = this.calculateCultureLevel(culturaScore);
    
    // Textos descritivos para cada nível
    const iaDescription = this.getShortDescription(iaLevel, 'ia');
    const culturaDescription = this.getShortDescription(culturaLevel, 'cultura');
    
    // Usar layout de gráficos um abaixo do outro
    const fullWidth = doc.page.width - 80; // 40px de margem de cada lado
    
    // Seção de Inteligência Artificial
    doc.fontSize(14)
       .fillColor(this.colors.secondary)
       .font(this.getFontBold())
       .text('NÍVEL DE MATURIDADE EM INTELIGÊNCIA ARTIFICIAL', 40, doc.y + 10, { width: fullWidth, align: 'center' });
    
    // Nome do nível IA
    doc.fontSize(18)
       .fillColor(this.colors.dark)
       .font(this.getFontBold())
       .text(iaLevel, 40, doc.y + 10, { width: fullWidth, align: 'center' });
    
    // Descrição do nível IA
    doc.fontSize(10)
       .fillColor(this.colors.secondary)
       .font(this.getFontRegular())
       .text(iaDescription, 40, doc.y + 5, { width: fullWidth, align: 'center' })
       .moveDown(0.5);
    
    // Adicionar gráfico IA centralizado com alta qualidade
    const chartDisplaySize = 250; // Tamanho IDÊNTICO para exibição de ambos os gráficos no PDF
    const xCenterIA = (doc.page.width - chartDisplaySize) / 2;
    doc.image(iaCanvas.toBuffer(), xCenterIA, doc.y, { width: chartDisplaySize, align: 'center' });
    
    // Avançar o cursor para depois do gráfico de IA
    doc.y += chartDisplaySize * 0.85 + 40;
    
    // Seção de Cultura
    doc.fontSize(14)
       .fillColor(this.colors.secondary)
       .font(this.getFontBold())
       .text('GRAU DE ALINHAMENTO CULTURAL COM INOVAÇÃO', 40, doc.y, { width: fullWidth, align: 'center' });
    
    // Nome do nível Cultura
    doc.fontSize(18)
       .fillColor(this.colors.dark)
       .font(this.getFontBold())
       .text(culturaLevel, 40, doc.y + 10, { width: fullWidth, align: 'center' });
    
    // Descrição do nível Cultura
    doc.fontSize(10)
       .fillColor(this.colors.secondary)
       .font(this.getFontRegular())
       .text(culturaDescription, 40, doc.y + 5, { width: fullWidth, align: 'center' })
       .moveDown(0.5);
    
    // Adicionar gráfico Cultura centralizado com alta qualidade - MESMO tamanho do gráfico IA
    const xCenterCultura = (doc.page.width - chartDisplaySize) / 2;
    doc.image(culturaCanvas.toBuffer(), xCenterCultura, doc.y, { width: chartDisplaySize, align: 'center' });
    
    // Avançar o cursor para depois do gráfico de Cultura
    doc.y += chartDisplaySize * 0.85 + 40;
    
    // Adicionar nova página para a seção 'O que isso significa para sua empresa?'
    doc.addPage();

    // Garantir espaço adequado após o cabeçalho
    doc.moveDown(3);
    
    // Adicionar seção 'O que isso significa para sua empresa?'
    doc.fontSize(18)
       .font(this.getFontBold())
       .fillColor(this.colors.dark)
       .text('O que isso significa para sua empresa?', 60, doc.y, { width: doc.page.width - 120, align: 'left' })
       .moveDown(1);
       
    // Usar as pontuações já calculadas anteriormente
    const analysis = this.analyzeCombination(iaScore, culturaScore);
    
    // Cálculo para dimensionamento do PDF
    const pageWidth = pageOrientation === 'portrait' ? 
      (pageSize === 'A4' ? 595.28 : 612) : 
      (pageSize === 'A4' ? 841.89 : 792);
    
    const margin = 60; // Margem ajustada para 60
    
    // Obter o texto "O que isso significa para sua empresa?" usando o método dedicado
    const companyMeaning = this.getCompanyMeaningTexts(iaLevel, culturaLevel);
    
    // Adicionar cada item da lista com bullet point
    companyMeaning.forEach(point => {
      doc.fontSize(12)
         .font(this.getFontRegular())
         .fillColor(this.colors.secondary)
         .text('•', 60, doc.y, { continued: true })
         .text(' ' + point, { width: doc.page.width - 140, align: 'left' })
         .moveDown(1);
    });
    
    // Adicionar nova página para recomendações
    doc.addPage();
    
    // Adicionar cabeçalho "RECOMENDAÇÕES SINGULARI"
    doc.fontSize(22)
      .font(this.getFontBold())
      .fillColor(this.colors.secondary) // Cor secundária (cinza)
      .text('RECOMENDAÇÕES', 60, doc.y + 20)
      .moveDown(0.2);
    
    doc.fontSize(30)
      .font(this.getFontBold())
      .fillColor(this.colors.primary) // Cor primária (azul escuro)
      .text('SINGULARI', 60, doc.y)
      .moveDown(1.5);
    
    // Adicionar informações de nível - duas colunas
    const halfWidth = (pageWidth - (margin * 2)) / 2;
    
    // Coluna esquerda - Nível de IA
    doc.fontSize(10)
      .font(this.getFontBold())
      .fillColor(this.colors.secondary)
      .text('NÍVEL DE MATURIDADE EM', 60, doc.y, { width: halfWidth, align: 'left' })
      .moveDown(0.1);
    
    doc.fontSize(10)
      .font(this.getFontBold())
      .fillColor(this.colors.secondary)
      .text('INTELIGÊNCIA ARTIFICIAL', 60, doc.y, { width: halfWidth, align: 'left' })
      .moveDown(0.3);
    
    doc.fontSize(16)
      .font(this.getFontBold())
      .fillColor(this.colors.primary)
      .text(iaLevel, 60, doc.y, { width: halfWidth, align: 'left' })
      .moveDown(0.5);
    
    // Salvar a posição y para alinhar as seções abaixo
    const startY = doc.y;
    
    // Coluna direita - Nível de Cultura
    doc.fontSize(10)
      .font(this.getFontBold())
      .fillColor(this.colors.secondary)
      .text('GRAU DE ALINHAMENTO CULTURAL', pageWidth / 2, startY - 43, { width: halfWidth, align: 'left' })
      .moveDown(0.1);
    
    doc.fontSize(10)
      .font(this.getFontBold())
      .fillColor(this.colors.secondary)
      .text('COM INOVAÇÃO', pageWidth / 2, startY - 30, { width: halfWidth, align: 'left' })
      .moveDown(0.3);
    
    doc.fontSize(16)
      .font(this.getFontBold())
      .fillColor(this.colors.primary)
      .text(culturaLevel, pageWidth / 2, startY - 15, { width: halfWidth, align: 'left' });
    
    // Reiniciar posição y após as duas colunas
    doc.y = startY + 25;
    
    // Usar recomendações da opção ou da análise combinada
    const recommendations = options.recommendations || analysis.recommendations;
    
    // ========== SEÇÃO: PONTOS FORTES ==========
    if (recommendations?.pontosFortes && recommendations.pontosFortes.length > 0) {
      // Criar o ícone de lâmpada com fundo arredondado
      const iconSize = 30;
      const iconX = 60;
      const iconY = doc.y + 10;
      const cornerRadius = 5;
      
      // Desenhar o quadrado com cantos arredondados
      doc.roundedRect(iconX - 15, iconY - 15, iconSize, iconSize, cornerRadius)
         .fillColor(this.colors.iconBg) // Verde 
         .fill();
      
      // Desenhar o ícone de lâmpada (representado por um círculo e um retângulo)
      // Nota: Poderia usar SVG para ícones mais complexos
      doc.circle(iconX, iconY, iconSize / 4)
         .fillColor(this.colors.iconColor) // Azul
         .fill();
      
      // Adicionar texto "PONTOS FORTES" com ícone
      doc.fontSize(14)
        .font(this.getFontBold())
        .fillColor(this.colors.dark)
        .text('PONTOS FORTES', 85, doc.y)
        .moveDown(0.5);
      
      // Adicionar itens como bullet points
      doc.fontSize(12)
        .font(this.getFontRegular())
        .fillColor(this.colors.secondary);
      
      recommendations.pontosFortes.forEach((ponto: string) => {
        doc.text('•', 85, doc.y, { continued: true })
           .text(' ' + ponto, { 
             align: 'left',
             width: pageWidth - 145 // Ajustar para alinhar com o título
           })
           .moveDown(0.5);
      });
      
      doc.moveDown(1);
    }
    
    // ========== SEÇÃO: ÁREAS DE MELHORIA ==========
    if (recommendations?.areasMelhoria && recommendations.areasMelhoria.length > 0) {
      // Criar o ícone de peças de quebra-cabeça com fundo arredondado
      const iconSize = 30;
      const iconX = 60;
      const iconY = doc.y + 10;
      const cornerRadius = 5;
      
      // Desenhar o quadrado com cantos arredondados
      doc.roundedRect(iconX - 15, iconY - 15, iconSize, iconSize, cornerRadius)
         .fillColor(this.colors.iconBg) // Verde
         .fill();
      
      // Desenhar o ícone de quebra-cabeças (simplificado)
      // Desenhar pequenos quadrados para representar peças
      const pieceSize = iconSize / 5;
      doc.rect(iconX - pieceSize / 2, iconY - pieceSize / 2, pieceSize, pieceSize)
         .fillColor(this.colors.iconColor) // Azul
         .fill();
      doc.rect(iconX + pieceSize / 2, iconY - pieceSize / 2, pieceSize, pieceSize)
         .fillColor(this.colors.iconColor)
         .fill();
      doc.rect(iconX - pieceSize / 2, iconY + pieceSize / 2, pieceSize, pieceSize)
         .fillColor(this.colors.iconColor)
         .fill();
      
      // Adicionar texto "ÁREAS DE MELHORIA" com ícone
      doc.fontSize(14)
        .font(this.getFontBold())
        .fillColor(this.colors.dark)
        .text('ÁREAS DE MELHORIA', 85, doc.y)
        .moveDown(0.5);
      
      // Adicionar itens como bullet points
      doc.fontSize(12)
        .font(this.getFontRegular())
        .fillColor(this.colors.secondary);
      
      recommendations.areasMelhoria.forEach((area: string) => {
        doc.text('•', 85, doc.y, { continued: true })
           .text(' ' + area, { 
             align: 'left',
             width: pageWidth - 145 // Ajustar para alinhar com o título
           })
           .moveDown(0.5);
      });
      
      doc.moveDown(1);
    }
    
    // ========== SEÇÃO: RECOMENDAÇÕES ==========
    if (recommendations?.recomendacoes && recommendations.recomendacoes.length > 0) {
      // Criar o ícone de foguete com fundo arredondado
      const iconSize = 30;
      const iconX = 60;
      const iconY = doc.y + 10;
      const cornerRadius = 5;
      
      // Desenhar o quadrado com cantos arredondados
      doc.roundedRect(iconX - 15, iconY - 15, iconSize, iconSize, cornerRadius)
         .fillColor(this.colors.iconBg) // Verde
         .fill();
      
      // Desenhar o ícone de foguete (simplificado)
      // Um triângulo para representar o foguete
      doc.moveTo(iconX, iconY - iconSize / 4)
         .lineTo(iconX - iconSize / 4, iconY + iconSize / 4)
         .lineTo(iconX + iconSize / 4, iconY + iconSize / 4)
         .closePath()
         .fillColor(this.colors.iconColor) // Azul
         .fill();
      
      // Adicionar texto "RECOMENDAÇÕES" com ícone
      doc.fontSize(14)
        .font(this.getFontBold())
        .fillColor(this.colors.dark)
        .text('RECOMENDAÇÕES', 85, doc.y)
        .moveDown(0.5);
      
      // Adicionar itens como bullet points
      doc.fontSize(12)
        .font(this.getFontRegular())
        .fillColor(this.colors.secondary);
      
      recommendations.recomendacoes.forEach((recomendacao: string) => {
        doc.text('•', 85, doc.y, { continued: true })
           .text(' ' + recomendacao, { 
             align: 'left',
             width: pageWidth - 145 // Ajustar para alinhar com o título
           })
           .moveDown(0.5);
      });
    }
    
    // Finalizar o documento
    doc.end();
    
    // Implementação do stream Readable
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => {
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

  /**
   * Calcula o nível de maturidade em IA com base na pontuação
   * @param score Pontuação de IA (10-40)
   * @returns Nível de maturidade
   */
  private calculateMaturityLevel(score: number): string {
    if (score < 18) return 'Tradicional';
    if (score < 27) return 'Exploradora';
    if (score < 34) return 'Inovadora';
    return 'Visionária';
  }

  /**
   * Calcula o nível de alinhamento cultural com base na pontuação
   * @param score Pontuação de cultura (10-40)
   * @returns Nível de alinhamento cultural
   */
  private calculateCultureLevel(score: number): string {
    if (score < 18) return 'Alta Resistência';
    if (score < 27) return 'Moderadamente Aberta';
    if (score < 34) return 'Favorável';
    return 'Altamente Alinhada';
  }
  
  /**
   * Obtem uma descrição curta para cada nível
   * @param level Nível de maturidade ou cultura
   * @param type Tipo ('ia' ou 'cultura')
   * @returns Descrição curta
   */
  private getShortDescription(level: string, type: 'ia' | 'cultura'): string {
    // Definir tipos específicos para evitar erro de índice
    type IALevels = 'Tradicional' | 'Exploradora' | 'Inovadora' | 'Visionária';
    type CulturaLevels = 'Alta Resistência' | 'Moderadamente Aberta' | 'Favorável' | 'Altamente Alinhada';
    
    const descriptions: Record<'ia' | 'cultura', Record<string, string>> = {
      ia: {
        'Tradicional': 'Processos manuais ou semi-automatizados com uso limitado de tecnologias.',
        'Exploradora': 'Começando a explorar soluções de IA em projetos pontuais.',
        'Inovadora': 'Adoção estruturada e uso crescente de IA.',
        'Visionária': 'IA integrada estrategicamente e gerando vantagens competitivas.'
      },
      cultura: {
        'Alta Resistência': 'Resistência significativa a mudanças e novas tecnologias.',
        'Moderadamente Aberta': 'Cultura que começa a valorizar inovação, mas com cautela.',
        'Favorável': 'Cultura que apoia a inovação, mas com espaço para melhorias.',
        'Altamente Alinhada': 'Cultura que abraça plenamente a inovação e transformação digital.'
      }
    };
    
    // Verificar se o nível existe nas descrições antes de acessar
    if (descriptions[type] && descriptions[type][level]) {
      return descriptions[type][level];
    }
    return '';
  }
  
  /**
   * Retorna o texto de diagnóstico para o nível de maturidade em IA
   * @param score Pontuação de IA
   * @param level Nível de maturidade
   * @returns Texto de diagnóstico
   */
  private getIADiagnosticText(score: number, level: string): string {
    // Textos base para cada nível de maturidade baseado no sistema do WordPress
    const diagnosticTexts: Record<string, string> = {
      'Tradicional': 'Sua organização está em um estágio inicial de adoção de IA, com uso limitado de tecnologias avançadas. Os processos são mais tradicionais e as iniciativas de IA são pontuais ou inexistentes. Há oportunidade para explorar os benefícios que a IA pode trazer para o seu negócio.',
      'Exploradora': 'Sua empresa já começou a explorar o uso de IA, com algumas iniciativas em andamento. As aplicações ainda são pontuais e não totalmente integradas à estratégia de negócios. Há um potencial significativo para expandir e estruturar melhor essas iniciativas.',
      'Inovadora': 'Sua organização demonstra um nível estruturado de maturidade em IA, com aplicações sendo usadas estrategicamente em áreas específicas. Existe uma compreensão ampla dos benefícios da IA e projetos bem desenvolvidos gerando resultados consistentes para o negócio.',
      'Visionária': 'Sua empresa está na vanguarda da adoção de IA, com uma estratégia clara e bem implementada. As tecnologias de IA estão integradas em diversas áreas e fazem parte fundamental dos processos de negócio, gerando valor significativo e vantagem competitiva.'
    };
    
    const baseText = diagnosticTexts[level] || 'Análise de maturidade em IA não disponível para o nível especificado.';
    let additionalText = '';
    
    // Adicionar texto específico baseado no nível
    if (level === 'Tradicional') {
      additionalText = '\n\nRecomendamos iniciar com uma fase de conscientização sobre IA, identificando oportunidades de aplicação de baixa complexidade e alto impacto. Invista em capacitação e considere parcerias com especialistas para acelerar sua jornada de IA.';
    } else if (level === 'Exploradora') {
      additionalText = '\n\nPara avançar, desenvolva uma estratégia mais estruturada para IA, invista em capacitação técnica e comece a integrar as iniciativas existentes. Estabeleça métricas claras e procure áreas de expansão com potencial de retorno rápido.';
    } else if (level === 'Inovadora') {
      additionalText = '\n\nO próximo passo é expandir o uso de IA para mais áreas de negócio, aprofundar a expertise técnica e estabelecer processos formais de governança. Busque oportunidades de escalabilidade e compartilhamento de conhecimento entre as áreas.';
    } else if (level === 'Visionária') {
      additionalText = '\n\nPara manter a liderança, foque em inovação contínua, governança robusta de IA e exploração de tecnologias emergentes. Fortaleça parcerias estratégicas e considere como sua organização pode contribuir para o avanço responsável da IA no mercado.';
    }

    return baseText + additionalText;
  }

  /**
   * Retorna o texto de diagnóstico para o nível de alinhamento cultural
   * @param score Pontuação de cultura
   * @param level Nível de alinhamento cultural
   * @returns Texto de diagnóstico
   */
  private getCultureDiagnosticText(score: number, level: string): string {
    // Textos base para cada nível de cultura baseado no sistema do WordPress
    const diagnosticTexts: Record<string, string> = {
      'Alta Resistência': 'A cultura organizacional atual apresenta resistência significativa à adoção de IA e novas tecnologias. Há receio quanto ao impacto da tecnologia nas funções existentes e pouca abertura para mudanças nos processos de trabalho. A liderança ainda não demonstra apoio claro às iniciativas de inovação.',
      'Moderadamente Aberta': 'Existe uma conscientização crescente sobre a importância da inovação e da IA, mas ainda há hesitação na adoção completa. A liderança começa a reconhecer o valor potencial, mas falta alinhamento em todos os níveis da organização. Alguns colaboradores estão abertos a novas tecnologias, enquanto outros mantêm reservas.',
      'Favorável': 'A organização tem uma cultura favorável à inovação e às mudanças trazidas pela IA. Há um entendimento claro dos benefícios potenciais e uma disposição para experimentar novas abordagens. A liderança apoia as iniciativas de IA e incentiva a participação dos colaboradores, criando um ambiente propício para a transformação digital.',
      'Altamente Alinhada': 'A organização possui uma cultura verdadeiramente transformadora, onde a inovação e a adoção de IA são valores fundamentais. Existe uma mentalidade de experimentação contínua e aprendizado em todos os níveis. A liderança está totalmente comprometida com a transformação digital e os colaboradores são incentivados a propor e implementar novas ideias.'
    };
    
    const baseText = diagnosticTexts[level] || 'Análise de alinhamento cultural não disponível para o nível especificado.';
    let additionalText = '';
    
    // Adicionar texto específico baseado no nível
    if (level === 'Alta Resistência') {
      additionalText = '\n\nPara evoluir, será essencial investir em comunicação clara sobre os benefícios da IA, demonstrar casos de sucesso e envolver os colaboradores no processo de transformação. Programas de conscientização e capacitação podem ajudar a reduzir o receio e construir confiança.';
    } else if (level === 'Moderadamente Aberta') {
      additionalText = '\n\nRecomendamos fortalecer o envolvimento da liderança, criar champions de inovação em diferentes áreas e implementar programas de capacitação que desmistifiquem a tecnologia. Celebre pequenas vitórias e compartilhe histórias de sucesso internamente.';
    } else if (level === 'Favorável') {
      additionalText = '\n\nO próximo passo é estabelecer mecanismos formais para incentivar a inovação, reconhecer e recompensar iniciativas bem-sucedidas e facilitar a colaboração entre equipes técnicas e de negócio. Considere programas estruturados de inovação aberta e experimentação.';
    } else if (level === 'Altamente Alinhada') {
      additionalText = '\n\nPara manter o alto nível de alinhamento cultural, continue cultivando uma mentalidade de aprendizado contínuo, permita a experimentação sem medo de falhas e promova a ética em IA como valor central. Busque ser referência no mercado e compartilhar suas práticas com o ecossistema.';
    }
    
    return baseText + additionalText;
  }
  
  /**
   * Gera uma análise combinada baseada nos níveis de IA e cultura
   * @param iaScore Pontuação de IA
   * @param culturaScore Pontuação de cultura
   * @returns Objeto com análise e recomendações
   */
  private analyzeCombination(iaScore: number, culturaScore: number): any {
    const iaLevel = this.calculateMaturityLevel(iaScore);
    const culturaLevel = this.calculateCultureLevel(culturaScore);
    const combinedKey = `${iaLevel}/${culturaLevel}`;
    
    // Texto diagnóstico da combinação
    const diagnosticText = this.diagnosticMapping[combinedKey] || 
      `Análise combinada não disponível para a combinação ${combinedKey}.`;
      
    // Estrutura de retorno
    return {
      ia_level: iaLevel,
      cultura_level: culturaLevel,
      diagnostic_text: diagnosticText,
      ia_score: iaScore,
      cultura_score: culturaScore,
      recommendations: this.getRecommendationsForCombination(iaLevel, culturaLevel)
    };
  }
  
  /**
   * Retorna recomendações específicas para cada combinação de níveis
   * @param iaLevel Nível de IA
   * @param culturaLevel Nível de cultura
   * @returns Objeto com recomendações
   */
  private getRecommendationsForCombination(iaLevel: string, culturaLevel: string): any {
    const combinedKey = `${iaLevel}/${culturaLevel}`;
    
    // Buscar as recomendações diretamente do arquivo de dados
    const recommendations = recommendationsData[combinedKey];
    
    // Se não encontrar recomendações específicas (o que não deve acontecer), gerar recomendações genéricas
    if (!recommendations) {
      const defaultRecommendations = {
        pontosFortes: [] as string[],
        areasMelhoria: [] as string[],
        recomendacoes: [] as string[]
      };
      
      // Recomendações genéricas baseadas no nível de IA
      if (iaLevel === 'Tradicional') {
        defaultRecommendations.recomendacoes.push('Inicie a jornada de IA com projetos piloto de baixa complexidade e alto impacto.');
      } else if (iaLevel === 'Exploradora') {
        defaultRecommendations.recomendacoes.push('Expanda as iniciativas de IA existentes e estabeleça processos mais estruturados.');
      } else if (iaLevel === 'Inovadora') {
        defaultRecommendations.recomendacoes.push('Consolide a governança de IA e amplie a integração com outras áreas da empresa.');
      } else if (iaLevel === 'Visionária') {
        defaultRecommendations.recomendacoes.push('Continue investindo em inovação e expansão das tecnologias de IA já implementadas.');
      }
      
      // Recomendações genéricas baseadas no nível de cultura
      if (culturaLevel === 'Alta Resistência') {
        defaultRecommendations.recomendacoes.push('Implemente programas de sensibilização e engajamento para reduzir a resistência cultural.');
      } else if (culturaLevel === 'Moderadamente Aberta') {
        defaultRecommendations.recomendacoes.push('Fortaleça a comunicação interna e promova iniciativas de capacitação para ampliar a abertura cultural.');
      } else if (culturaLevel === 'Favorável') {
        defaultRecommendations.recomendacoes.push('Aproveite a cultura favorável para acelerar projetos de inovação e expandir iniciativas bem-sucedidas.');
      } else if (culturaLevel === 'Altamente Alinhada') {
        defaultRecommendations.recomendacoes.push('Aproveite a cultura favorável para acelerar a adoção de novas tecnologias e manter o ritmo de inovação.');
      }
      
      return defaultRecommendations;
    }
    
    return recommendations;
  }
  
  /**
   * Obtenha textos de diagnóstico considerando a combinação de IA e cultura
   * @param score Pontuação (IA ou cultura)
   * @param level Nível identificado 
   * @param type Tipo de diagnóstico ('ia' ou 'cultura')
   */
  private getCombinedDiagnosticText(score: number, level: string, type: 'ia' | 'cultura'): string {
    // Obter o texto base dependendo do tipo
    if (type === 'ia') {
      return this.getIADiagnosticText(score, level);
    } else {
      return this.getCultureDiagnosticText(score, level);
    }
  }

  /**
   * Retorna textos específicos para "O que isso significa para sua empresa?" com base na combinação
   * de níveis de maturidade em IA e cultura
   * @param iaLevel Nível de maturidade em IA
   * @param culturaLevel Nível de cultura
   * @returns Array de strings com os textos específicos para a combinação
   */
  private getCompanyMeaningTexts(iaLevel: string, culturaLevel: string): string[] {
    const key = `${iaLevel}/${culturaLevel}`;
    
    // Definir todos os 16 textos possíveis para cada combinação
    const companyMeaningTexts: Record<string, string[]> = {
      'Tradicional/Alta Resistência': [
        'Sua empresa adota um modelo tradicional, com uso limitado de IA e métodos consolidados que dificultam a inovação.',
        'A cultura organizacional demonstra certa relutância a mudanças, o que pode retardar a introdução de novas tecnologias.',
        'O próximo passo é iniciar capacitações e projetos piloto de baixo risco para, gradualmente, preparar a empresa para a transformação digital.'
      ],
      'Tradicional/Moderadamente Aberta': [
        'Sua empresa mantém um perfil tradicional em termos de IA, com iniciativas pontuais e baixo investimento tecnológico.',
        'Embora existam alguns desafios culturais, nota-se uma abertura que pode ser cultivada para favorecer a inovação.',
        'O próximo passo é desenvolver um roadmap gradual, alinhando capacitação e parcerias para integrar a tecnologia aos objetivos de inovação.'
      ],
      'Tradicional/Favorável': [
        'Sua empresa demonstra uma abordagem tradicional no uso de IA, mas conta com uma cultura que valoriza a inovação.',
        'Apesar da cultura favorável, é importante desenvolver processos mais estruturados e ampliar os investimentos tecnológicos para expandir a utilização da IA.',
        'O próximo passo é formalizar processos e elaborar um roadmap tecnológico que capitaliza a cultura inovadora já existente.'
      ],
      'Tradicional/Altamente Alinhada': [
        'Sua empresa opera de maneira tradicional em IA, mesmo em meio a uma cultura altamente alinhada à inovação.',
        'Mesmo com uma cultura muito positiva, a aplicação prática da tecnologia pode se beneficiar de processos mais consolidados.',
        'O próximo passo é acelerar as iniciativas de IA com investimentos estratégicos e metas integradas, aproveitando a cultura positiva.'
      ],
      'Exploradora/Alta Resistência': [
        'Sua empresa já iniciou a adoção de IA, demonstrando interesse em explorar novas tecnologias, mas enfrenta barreiras culturais significativas.',
        'Algumas dificuldades na comunicação dos benefícios e uma certa resistência interna podem moderar o avanço dos projetos.',
        'O próximo passo é implementar campanhas de sensibilização e programas de mentoria para reduzir a resistência e consolidar as iniciativas exploratórias.'
      ],
      'Exploradora/Moderadamente Aberta': [
        'Sua empresa está dando os primeiros passos na adoção de IA, com projetos exploratórios que revelam interesse pela inovação.',
        'A expansão dos projetos pode ser aprimorada com uma integração maior e o estabelecimento de indicadores que permitam mensurar os resultados.',
        'O próximo passo é desenvolver um roadmap estratégico que alinhe os projetos de IA aos objetivos culturais, estabelecendo KPIs e promovendo fóruns interdepartamentais.'
      ],
      'Exploradora/Favorável': [
        'Sua empresa já apresenta iniciativas de IA promissoras, apoiadas por uma cultura organizacional que incentiva a inovação.',
        'Apesar dos resultados promissores, a formalização dos processos e uma integração mais ampla entre as áreas podem potencializar os resultados.',
        'O próximo passo é estruturar os processos de expansão dos pilotos e investir em capacitação avançada para maximizar os resultados.'
      ],
      'Exploradora/Altamente Alinhada': [
        'Sua empresa está explorando a IA com iniciativas iniciais que demonstram potencial, sustentadas por uma cultura altamente alinhada e com liderança engajada.',
        'A consolidação de uma estratégia e a padronização dos processos podem ajudar a avançar da fase exploratória para uma implementação mais completa.',
        'O próximo passo é desenvolver um roadmap robusto, intensificar os investimentos em tecnologia e adotar uma governança adaptativa para estruturar os projetos.'
      ],
      'Inovadora/Alta Resistência': [
        'Sua empresa já utiliza a IA de forma estruturada, gerando resultados positivos, mas enfrenta forte resistência cultural.',
        'Melhorar a comunicação dos benefícios e fortalecer a integração entre as áreas pode ser fundamental para ampliar os projetos.',
        'O próximo passo é implementar ações de gestão de mudanças, reestruturar a organização e desenvolver campanhas internas que destaquem os ganhos da inovação.'
      ],
      'Inovadora/Moderadamente Aberta': [
        'Sua empresa demonstra um uso sólido de IA, com resultados consistentes, mesmo que a abertura cultural seja moderada.',
        'Uma maior integração dos colaboradores e das áreas operacionais pode contribuir para potencializar os projetos já consolidados.',
        'O próximo passo é intensificar capacitações, formalizar a governança e promover a integração de stakeholders para fortalecer a transformação digital.'
      ],
      'Inovadora/Favorável': [
        'Sua empresa utiliza a IA de forma estruturada e conta com uma cultura que apoia ativamente a inovação e a colaboração.',
        'Mesmo com um bom equilíbrio entre tecnologia e cultura, aprimorar a escalabilidade e garantir a continuidade dos investimentos pode impulsionar os resultados.',
        'O próximo passo é consolidar processos, fomentar a inovação contínua e implementar programas de reconhecimento para manter a competitividade.'
      ],
      'Inovadora/Altamente Alinhada': [
        'Sua empresa já consolidou projetos de IA que geram impacto estratégico, sustentados por uma cultura robusta e integrada.',
        'A sinergia entre as áreas já gera avanços notáveis; contudo, manter um ritmo constante de inovação pode ajudar a evitar eventuais estagnações.',
        'O próximo passo é investir em P&D, estabelecer parcerias estratégicas e monitorar proativamente os resultados para continuar evoluindo.'
      ],
      'Visionária/Alta Resistência': [
        'Sua empresa possui uma visão estratégica de IA e realiza investimentos significativos, mas enfrenta forte resistência cultural.',
        'Embora a visão estratégica seja sólida, ajustar a implementação prática pode facilitar a adoção completa da inovação pelos colaboradores.',
        'O próximo passo é promover uma mudança cultural intensiva, integrando equipes e, se necessário, recorrer a consultorias especializadas para alinhar a prática à estratégia.'
      ],
      'Visionária/Moderadamente Aberta': [
        'Sua empresa tem uma estratégia de IA avançada e realiza investimentos robustos, mas a cultura ainda está se adaptando à visão tecnológica.',
        'Os projetos-piloto já apresentam resultados positivos; aprimorar a comunicação e a disseminação das boas práticas pode ampliar ainda mais o impacto.',
        'O próximo passo é refinar a comunicação interna, incentivar o engajamento dos colaboradores e revisar os processos decisórios para acelerar a transformação digital.'
      ],
      'Visionária/Favorável': [
        'Sua empresa se destaca como referência na adoção estratégica de IA, com uma cultura altamente colaborativa e adaptável.',
        'Embora a capacidade de ajuste seja excelente, explorar tecnologias emergentes e otimizar a integração entre as áreas pode fortalecer ainda mais sua posição.',
        'O próximo passo é investir em parcerias estratégicas, otimizar processos e promover treinamentos focados em novas tendências para consolidar a liderança.'
      ],
      'Visionária/Altamente Alinhada': [
        'Sua empresa atinge um nível de excelência, com plena integração entre tecnologia e cultura, posicionando-se como referência em inovação.',
        'A elevada capacidade de adaptação é um grande diferencial; contudo, ajustes contínuos na complexidade dos processos podem garantir uma evolução consistente.',
        'O próximo passo é fomentar a pesquisa interna, realizar benchmarking global e desenvolver uma estratégia de sustentabilidade que garanta a continuidade dos avanços.'
      ]
    };

    // Retornar os textos específicos para a combinação ou um texto padrão se não encontrado
    return companyMeaningTexts[key] || [
      'Sua empresa está em uma jornada de transformação digital que requer atenção tanto aos aspectos tecnológicos quanto culturais.',
      'A integração entre tecnologia e cultura organizacional é fundamental para o sucesso das iniciativas de IA.',
      'O próximo passo é avaliar detalhadamente os fatores específicos que influenciam sua maturidade em IA e cultura para desenvolver um plano personalizado.'
    ];
  }
}
