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
    
    // Adicionar nova página para recomendações
    doc.addPage();
    
    // Adicionar seção de recomendações
    doc.fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#333333')
      .text('Recomendações e Próximos Passos', { align: 'left' })
      .moveDown(1);
    
    // Usar recomendações da opção ou da análise combinada
    const recommendations = options.recommendations || analysis.recommendations;
    
    // Adicionar pontos fortes se disponíveis
    if (recommendations?.pontosFortes && recommendations.pontosFortes.length > 0) {
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#4CAF50')
        .text('Pontos Fortes', { align: 'left' })
        .moveDown(0.5);
      
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#333333');
      
      recommendations.pontosFortes.forEach((ponto: string, index: number) => {
        doc.text(`${index + 1}. ${ponto}`, {
          align: 'left',
          width: pageWidth - (margin * 2)
        })
        .moveDown(0.5);
      });
      
      doc.moveDown(1);
    }
    
    // Adicionar áreas de melhoria se disponíveis
    if (recommendations?.areasMelhoria && recommendations.areasMelhoria.length > 0) {
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#FF9800')
        .text('Áreas para Melhoria', { align: 'left' })
        .moveDown(0.5);
      
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#333333');
      
      recommendations.areasMelhoria.forEach((area: string, index: number) => {
        doc.text(`${index + 1}. ${area}`, {
          align: 'left',
          width: pageWidth - (margin * 2)
        })
        .moveDown(0.5);
      });
      
      doc.moveDown(1);
    }
    
    // Adicionar recomendações específicas se disponíveis
    if (recommendations?.recomendacoes && recommendations.recomendacoes.length > 0) {
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1a73e8')
        .text('Recomendações Específicas', { align: 'left' })
        .moveDown(0.5);
      
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#333333');
      
      recommendations.recomendacoes.forEach((recomendacao: string, index: number) => {
        doc.text(`${index + 1}. ${recomendacao}`, {
          align: 'left',
          width: pageWidth - (margin * 2)
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
    // Estrutura padrão
    const recommendations = {
      pontosFortes: [] as string[],
      areasMelhoria: [] as string[],
      recomendacoes: [] as string[]
    };
    
    const combinedKey = `${iaLevel}/${culturaLevel}`;
    
    // Definição de pontos fortes para cada combinação
    // Apenas algumas combinações como exemplo (na implementação completa, todas as 16 combinações seriam mapeadas)
    if (combinedKey === 'Tradicional/Alta Resistência') {
      recommendations.pontosFortes = [
        'Processos tradicionais que garantem estabilidade.',
        'Estrutura organizacional que mantém consistência.',
        'Conservação dos métodos já testados, que podem ser úteis como base para mudanças graduais.'
      ];
      
      recommendations.areasMelhoria = [
        'Necessidade urgente de abrir espaço para novas tecnologias.',
        'Forte resistência cultural que dificulta a adoção de mudanças.',
        'Baixo investimento em inovação e atualização tecnológica.'
      ];
      
      recommendations.recomendacoes = [
        'Capacitação e Sensibilização: Inicie programas de treinamento e workshops para demonstrar os benefícios da IA e da inovação.',
        'Projetos Piloto: Comece com iniciativas de baixo risco para gerar resultados e construir confiança.',
        'Comunicação Interna: Estabeleça canais que promovam a troca de ideias e uma cultura de experimentação.'
      ];
    } 
    else if (combinedKey === 'Tradicional/Moderadamente Aberta') {
      recommendations.pontosFortes = [
        'Alguma abertura para mudanças e experimentação.',
        'Interesse em inovação, mesmo que ainda incipiente.',
        'Capacidade de adaptação em momentos pontuais, demonstrando potencial de evolução.'
      ];
      
      recommendations.areasMelhoria = [
        'Baixa adoção estruturada de tecnologias de IA.',
        'Processos tradicionais que limitam a escalabilidade.',
        'Falta de alinhamento claro entre a estratégia tecnológica e os objetivos de inovação.'
      ];
      
      recommendations.recomendacoes = [
        'Estratégia Gradual: Desenvolva um roadmap que aproveite a abertura cultural para a introdução de IA.',
        'Incentivo à Experimentação: Promova pilotos em áreas estratégicas com acompanhamento de métricas de desempenho.',
        'Fortalecimento da Governança: Estruture processos que integrem a inovação à rotina operacional.'
      ];
    }
    else if (combinedKey === 'Visionária/Altamente Alinhada') {
      recommendations.pontosFortes = [
        'Maturidade avançada em IA com aplicações em toda a organização.',
        'Cultura plenamente alinhada com a inovação e transformação digital.',
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
