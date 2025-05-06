import PDFDocument from 'pdfkit';
import { Canvas, createCanvas } from 'canvas';
import { ChartService } from './chart.service';
import { RadarChartData, PdfOptions, ChartDataset } from '../interfaces/chart.interface';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

export class PdfService {
  private chartService: ChartService;
  private assetsPath: string;
  
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
    // Configurações do gráfico ajustadas para melhor qualidade e visualização
    const chartWidth = 250;  // Reduzido para 50% do tamanho anterior
    const chartHeight = 250; // Altura ajustada para manter proporções
    
    // Criar os canvas e gerar os gráficos
    const iaCanvas = createCanvas(chartWidth, chartHeight);
    const culturaCanvas = createCanvas(chartWidth, chartHeight);
    
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
      width: chartWidth,
      height: chartHeight
    });
    
    this.chartService.generateRadarChart(culturaCanvas, {
      ...culturaChartData,
      title: '',  // Sem título no gráfico, será adicionado como texto no PDF
      datasets: culturaDatasets,
      width: chartWidth,
      height: chartHeight
    });
    
    // Garantir que os gráficos sejam renderizados
    await new Promise<void>(resolve => setTimeout(resolve, 200));
    
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
    
    // Cabeçalho azul escuro para a primeira página
    doc.rect(0, 0, doc.page.width, 50)
       .fill('#1E2A4A');  // Azul escuro no topo da página
    
    // Texto do cabeçalho
    doc.fillColor('white')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Diagnóstico | Relatório Completo', 50, 18, { align: 'left' });
    
    // Configurar cabeçalho para as próximas páginas
    doc.on('pageAdded', () => {
      doc.rect(0, 0, doc.page.width, 50)
         .fill('#1E2A4A');
      doc.fillColor('white')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Diagnóstico | Relatório Completo', 50, 18, { align: 'left' });
    });
       
    // Título principal 'Seu resultado' centralizado - com espaço adequado do cabeçalho
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#334A7C')  // Azul mais claro
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
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text('NÍVEL DE MATURIDADE EM INTELIGÊNCIA ARTIFICIAL', 40, doc.y + 10, { width: fullWidth, align: 'center' });
    
    // Nome do nível IA
    doc.fontSize(18)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(iaLevel, 40, doc.y + 10, { width: fullWidth, align: 'center' });
    
    // Descrição do nível IA
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(iaDescription, 40, doc.y + 5, { width: fullWidth, align: 'center' })
       .moveDown(0.5);
    
    // Adicionar gráfico IA centralizado com alta qualidade
    const iaChartWidth = 225; // Reduzido para 50% do tamanho anterior
    const xCenterIA = (doc.page.width - iaChartWidth) / 2;
    doc.image(iaCanvas.toBuffer(), xCenterIA, doc.y, { width: iaChartWidth, align: 'center' });
    
    // Avançar o cursor para depois do gráfico de IA
    doc.y += chartHeight * 0.85 + 40;
    
    // Seção de Cultura
    doc.fontSize(14)
       .fillColor('#333333')
       .font('Helvetica-Bold')
       .text('GRAU DE ALINHAMENTO CULTURAL COM INOVAÇÃO', 40, doc.y, { width: fullWidth, align: 'center' });
    
    // Nome do nível Cultura
    doc.fontSize(18)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(culturaLevel, 40, doc.y + 10, { width: fullWidth, align: 'center' });
    
    // Descrição do nível Cultura
    doc.fontSize(10)
       .fillColor('#666666')
       .font('Helvetica')
       .text(culturaDescription, 40, doc.y + 5, { width: fullWidth, align: 'center' })
       .moveDown(0.5);
    
    // Adicionar gráfico Cultura centralizado com alta qualidade
    const culturaChartWidth = 225; // Reduzido para 50% do tamanho anterior
    const xCenterCultura = (doc.page.width - culturaChartWidth) / 2;
    doc.image(culturaCanvas.toBuffer(), xCenterCultura, doc.y, { width: culturaChartWidth, align: 'center' });
    
    // Avançar o cursor para depois do gráfico de Cultura
    doc.y += chartHeight * 0.85 + 40;
    
    // Adicionar nova página para a seção 'O que isso significa para sua empresa?'
    doc.addPage();

    // Garantir espaço adequado após o cabeçalho
    doc.moveDown(3);
    
    // Adicionar seção 'O que isso significa para sua empresa?'
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#334A7C')
       .text('O que isso significa para sua empresa?', 60, doc.y, { width: doc.page.width - 120, align: 'left' })
       .moveDown(1);
       
    // Usar as pontuações já calculadas anteriormente
    const analysis = this.analyzeCombination(iaScore, culturaScore);
    
    // Bulleted list como mostrado na imagem de referência
    const bulletPoints = [
      'Sua empresa utiliza a IA de forma estruturada e conta com uma cultura que apoia ativamente a inovação e a colaboração.',
      'Mesmo com um bom equilíbrio entre tecnologia e cultura, aprimorar a escalabilidade e garantir a continuidade dos investimentos pode impulsionar os resultados.',
      'O próximo passo é consolidar processos, fomentar a inovação contínua e implementar programas de reconhecimento para manter a competitividade.'
    ];
    
    // Adicionar cada item da lista com bullet point
    bulletPoints.forEach(point => {
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#333333')
         .text('•', 60, doc.y, { continued: true })
         .text(' ' + point, { width: doc.page.width - 140, align: 'left' })
         .moveDown(1);
    });
    
    // Cálculo para dimensionamento do PDF
    const pageWidth = pageOrientation === 'portrait' ? 
      (pageSize === 'A4' ? 595.28 : 612) : 
      (pageSize === 'A4' ? 841.89 : 792);
    
    const margin = 60; // Margem ajustada para 60
    
    // Adicionar diagnóstico de cultura
    doc.fontSize(12)
      .font('Helvetica')
      .fillColor('#333333')
      .text(this.getCultureDiagnosticText(options.culturaScore || 0, culturaLevel), {
        align: 'justify',
        width: pageWidth - (margin * 2)
      })
      .moveDown(1);
    
      
    // Adicionar diagnóstico combinado se existir
    if (analysis.diagnostic_text && !options.skipCombinedAnalysis) {
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#333333')
        .text('Análise Combinada', { align: 'left' })
        .moveDown(0.5);
        
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#333333')
        .text(analysis.diagnostic_text, {
          align: 'justify',
          width: pageWidth - (margin * 2)
        })
        .moveDown(2);
    } else {
      doc.moveDown(1);
    }
    
    // Adicionar nova página para recomendações conforme layout da imagem
    doc.addPage();
    
    // Garantir espaço após o cabeçalho
    doc.moveDown(2);
    
    // Título da página
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#334A7C')  // Azul escuro
       .text('RECOMENDAÇÕES', 60, doc.y, { width: doc.page.width - 120, align: 'left' })
       .moveDown(0.5);
      
    // Nome da empresa em fonte grande
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#3F51B5')  // Azul mais vibrante
       .text('SINGULARI', 60, doc.y, { width: doc.page.width - 120, align: 'left' })
       .moveDown(1.5);
    
    // Usar recomendações da opção ou da análise combinada
    const recommendations = options.recommendations || analysis.recommendations;

    // Seção de níveis lado a lado
    const startY = doc.y;
    const columnWidth = (doc.page.width - 120) / 2;
    
    // Coluna 1: Nível de IA
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#666666')
       .text('NÍVEL DE MATURIDADE EM', 60, doc.y, { width: columnWidth, align: 'left' })
       .text('INTELIGÊNCIA ARTIFICIAL', 60, doc.y, { width: columnWidth, align: 'left' })
       .moveDown(0.5);
    
    // Nome do nível de IA
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#3F51B5')
       .text(iaLevel, 60, doc.y, { width: columnWidth, align: 'left' })
       .moveDown(0.5);
    
    // Resetar posição Y para a coluna 2
    doc.y = startY;
    
    // Coluna 2: Grau de alinhamento cultural
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#666666')
       .text('GRAU DE ALINHAMENTO CULTURAL', 60 + columnWidth, startY, { width: columnWidth, align: 'left' })
       .text('COM INOVAÇÃO', 60 + columnWidth, doc.y, { width: columnWidth, align: 'left' })
       .moveDown(0.5);
    
    // Nome do nível de cultura
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#3F51B5')
       .text(culturaLevel, 60 + columnWidth, doc.y, { width: columnWidth, align: 'left' })
       .moveDown(2);
    
    // Ajustar posição para o conteúdo seguinte
    doc.y = Math.max(doc.y, startY + 100);
      
    // PONTOS FORTES com ícone - conforme imagem
    if (recommendations?.pontosFortes && recommendations.pontosFortes.length > 0) {
      // Desenhar retângulo pequeno para o ícone (amarelo)
      doc.rect(60, doc.y, 30, 30)
         .fill('#FFC107');

      // Adicionar ícone (simulando uma lâmpada)
      doc.fontSize(18)
         .fillColor('#FFFFFF')
         .text('☀', 67, doc.y - 24);
        
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#3F51B5')
        .text('PONTOS FORTES', 100, doc.y - 25, { width: doc.page.width - 160, align: 'left' })
        .moveDown(0.5);
      
      // Espaço após o título
      doc.y += 10;
        
      // Adicionar lista com bullets
      recommendations.pontosFortes.forEach((ponto: string) => {
        doc.fontSize(12)
          .font('Helvetica')
          .fillColor('#333333')
          .text('•', 100, doc.y, { continued: true })
          .text(' ' + ponto, { width: doc.page.width - 180, align: 'left' })
          .moveDown(0.5);
      });
      
      doc.moveDown(1);
    }
    
    // ÁREAS DE MELHORIA com ícone - conforme imagem
    if (recommendations?.areasMelhoria && recommendations.areasMelhoria.length > 0) {
      // Desenhar retângulo pequeno para o ícone (azul claro)
      doc.rect(60, doc.y, 30, 30)
         .fill('#03A9F4');
        
      // Adicionar ícone (simulando um gráfico)
      doc.fontSize(18)
         .fillColor('#FFFFFF')
         .text('↑', 70, doc.y - 23);
         
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#3F51B5')
        .text('ÁREAS DE MELHORIA', 100, doc.y - 25, { width: doc.page.width - 160, align: 'left' })
        .moveDown(0.5);
      
      // Espaço após o título
      doc.y += 10;
        
      // Adicionar lista com bullets
      recommendations.areasMelhoria.forEach((area: string) => {
        doc.fontSize(12)
          .font('Helvetica')
          .fillColor('#333333')
          .text('•', 100, doc.y, { continued: true })
          .text(' ' + area, { width: doc.page.width - 180, align: 'left' })
          .moveDown(0.5);
      });
      
      doc.moveDown(1);
    }
    
    // RECOMENDAÇÕES com ícone - conforme imagem
    if (recommendations?.recomendacoes && recommendations.recomendacoes.length > 0) {
      // Desenhar retângulo pequeno para o ícone (verde)
      doc.rect(60, doc.y, 30, 30)
         .fill('#4CAF50');
         
      // Adicionar ícone (simulando uma estrela)
      doc.fontSize(18)
         .fillColor('#FFFFFF')
         .text('★', 67, doc.y - 23);
      
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#3F51B5')
        .text('RECOMENDAÇÕES', 100, doc.y - 25, { width: doc.page.width - 160, align: 'left' })
        .moveDown(0.5);
      
      // Espaço após o título
      doc.y += 10;
        
      // Adicionar lista com bullets
      recommendations.recomendacoes.forEach((rec: string) => {
        doc.fontSize(12)
          .font('Helvetica')
          .fillColor('#333333')
          .text('•', 100, doc.y, { continued: true })
          .text(' ' + rec, { width: doc.page.width - 180, align: 'left' })
          .moveDown(0.5);
      });
    }
    
    // Finalizar o documento
    doc.end();
{{ ... }}
        'Governança e estratégia claras que impulsionam o negócio.'
      ];
      
      recommendations.areasMelhoria = [
        'Manter a vanguarda em tecnologias emergentes.',
        'Continuar promovendo a ética e a responsabilidade no uso da IA.',
        'Expandir para novas fronteiras de inovação e pesquisa.'
      ];
      
      recommendations.recomendacoes = [
        'Mantenha-se na vanguarda: Continue investindo em P&D de tecnologias emergentes como IA generativa e computação quântica.',
        'Promova o ecossistema: Desenvolva parcerias com startups, universidades e centros de pesquisa.',
        'Compartilhe conhecimento: Estabeleça programas para compartilhar boas práticas com o mercado, posicionando-se como referência.'
      ];
    }
    // ... outras combinações seriam implementadas de forma similar
    
    // Se não encontrar recomendações específicas, gera recomendações baseadas em cada nível individualmente
    if (recommendations.pontosFortes.length === 0) {
      // Recomendações genéricas baseadas no nível de IA
      if (iaLevel === 'Tradicional') {
        recommendations.recomendacoes.push('Inicie a jornada de IA com projetos piloto de baixa complexidade e alto impacto.');
      } else if (iaLevel === 'Visionária') {
        recommendations.recomendacoes.push('Continue investindo em inovação e expansão das tecnologias de IA já implementadas.');
      }
      
      // Recomendações genéricas baseadas no nível de cultura
      if (culturaLevel === 'Alta Resistência') {
        recommendations.recomendacoes.push('Implemente programas de sensibilização e engajamento para reduzir a resistência cultural.');
      } else if (culturaLevel === 'Altamente Alinhada') {
        recommendations.recomendacoes.push('Aproveite a cultura favorável para acelerar a adoção de novas tecnologias.');
      }
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
}
