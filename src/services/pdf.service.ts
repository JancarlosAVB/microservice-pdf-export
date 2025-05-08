import PDFDocument from 'pdfkit';
import { Canvas, createCanvas } from 'canvas';
import { ChartService } from './chart.service';
import { RadarChartData, PdfOptions, ChartDataset } from '../interfaces/chart.interface';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { DiagnosticService } from './diagnostic.service';
import { WritableBufferStream } from '../utils/buffer-stream';

export class PdfService {
  private chartService: ChartService;
  private assetsPath: string;
  private diagnosticService: DiagnosticService;
  
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

  // Mapeamento de significado de empresa para combinações de IA e Cultura
  private companyMeaning: Record<string, string[]> = {
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

  /**
   * Obtém a lista de significados para empresa baseado na combinação de níveis
   * @param iaLevel Nível de maturidade em IA
   * @param culturaLevel Nível de cultura
   * @returns Array de frases com significados para a empresa
   */
  public getCompanyMeaning(iaLevel: string, culturaLevel: string): string[] {
    const key = `${iaLevel}/${culturaLevel}`;
    return this.companyMeaning[key] || [
      'Não foi possível determinar um significado específico para esta combinação de níveis.',
      'Por favor, revise os dados inseridos ou entre em contato com o suporte.',
      'Recomendamos uma nova avaliação para obter insights mais precisos.'
    ];
  }

  constructor() {
    this.chartService = new ChartService();
    this.diagnosticService = new DiagnosticService();
    // Caminho para os assets (imagens, fontes, etc.)
    this.assetsPath = path.join(process.cwd(), 'assets');
  }

  /**
   * Gera uma página de título para o PDF
   */
  private generateTitlePage(doc: any, options: PdfOptions): void {
    // Adicionar página e definir fundo
    doc.addPage();
    
    // Cor de fundo azul escuro para toda a página
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#1E2A4A');
    
    // Título centralizado em branco
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('white')
       .text(options.title || 'Diagnóstico de Maturidade em IA e Cultura Organizacional', {
          align: 'center',
          width: doc.page.width - 80,
          height: doc.page.height,
          y: doc.page.height / 3
       });
    
    // Subtítulo em cinza claro
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#cccccc')
       .text('Análise de maturidade e recomendações estratégicas', {
          align: 'center',
          width: doc.page.width - 100
       })
       .moveDown(4);
    
    // Informações da empresa (se fornecidas)
    if (options.company) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text('Empresa:', {
            align: 'center',
            width: doc.page.width - 100,
            continued: true
         })
         .font('Helvetica')
         .text(' ' + options.company);
    }
    
    // Rodapé com data
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#cccccc')
       .text('Documento gerado em ' + new Date().toLocaleDateString('pt-BR'), {
          align: 'center',
          width: doc.page.width,
          y: doc.page.height - 50
       });
  }

  /**
   * Gera uma página contendo um gráfico radar
   */
  private generateChartPage(doc: any, chartData: RadarChartData, title: string, options: PdfOptions): void {
    // Adicionar nova página
    doc.addPage();
    
    // Cabeçalho azul
    doc.rect(0, 0, doc.page.width, 30)
       .fill('#1E2A4A');
    
    // Texto do cabeçalho
    doc.fillColor('white')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(title, 20, 10);
    
    // Espaço para o título
    doc.moveDown(3);
    
    // Título do gráfico
    doc.fillColor('#333333')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(title, {
          align: 'center',
          width: doc.page.width - 40
       })
       .moveDown(1);
    
    // Preparar canvas para o gráfico
    const chartWidth = 400;
    const chartHeight = 400;
    const canvas = createCanvas(chartWidth, chartHeight);
    
    // Desenhar gráfico no canvas
    this.chartService.generateRadarChart(canvas, {
      ...chartData,
      width: chartWidth,
      height: chartHeight
    });
    
    // Centralizar o gráfico na página
    const x = (doc.page.width - chartWidth) / 2;
    
    // Adicionar o gráfico ao PDF
    doc.image(canvas.toBuffer(), x, doc.y, {
      width: chartWidth,
      height: chartHeight
    });
    
    // Adicionar legenda
    doc.moveDown(0.5);
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#666666')
       .text('Quanto maior o valor em cada dimensão, maior a maturidade/alinhamento.', {
          align: 'center',
          width: doc.page.width - 60
       });
  }

  /**
   * Gera um PDF de diagnóstico completo com dois gráficos radar e análises
   * @param iaChartData Dados do gráfico radar de IA
   * @param culturaChartData Dados do gráfico radar de cultura
   * @param options Opções do PDF
   * @param formData Dados do formulário (opcional)
   * @returns Stream do PDF gerado
   */
  public async generateDiagnosticPdf(
    iaChartData: RadarChartData, 
    culturaChartData: RadarChartData, 
    options: PdfOptions = {},
    formData?: Record<string, any>
  ): Promise<Readable> {
    // Configurar o stream de resposta
    const stream = new Readable({
      read() {
        // Implementação vazia pois preenchemos o stream após o PDF ser gerado
      }
    });
    
    try {
      console.log('Iniciando geração de PDF de diagnóstico');
      
      // Gerar PDF com PDFKit
      const doc = new PDFDocument({
        size: options.pageSize || 'A4',
        layout: options.pageOrientation || 'portrait',
        margins: {
          top: 30,
          bottom: 30,
          left: 40,
          right: 40
        },
        bufferPages: true,
        info: {
          Title: options.title || 'Diagnóstico de IA e Cultura',
          Author: options.author || 'Sistema de Diagnóstico',
          Subject: options.subject || 'Análise de Maturidade em IA e Cultura Organizacional',
          Keywords: options.keywords || 'IA, Inteligência Artificial, Cultura, Organização'
        }
      });
      
      // Configurar o WritableBufferStream para capturar todo o conteúdo
      const bufferStream = new WritableBufferStream((pdfBuffer) => {
        stream.push(pdfBuffer);
        stream.push(null); // Finalizar o stream
      });
      
      // Pipe do doc para o buffer stream - agora funciona corretamente
      doc.pipe(bufferStream);
      
      // Verificar se temos dados do WordPress com formData
      const usingWordPressData = formData && 
                                (formData._use_direct_values === true || 
                                 formData._ia_level || 
                                 formData._combined_analysis);
      
      console.log('Usando dados diretos do WordPress?', usingWordPressData ? 'Sim' : 'Não');
      
      // Adicionar página de capa com fundo colorido
      this.generateTitlePage(doc, options);
      
      // Adicionar página de gráfico de IA
      this.generateChartPage(doc, iaChartData, 'Maturidade em IA', options);
      
      // Adicionar página de gráfico de Cultura
      this.generateChartPage(doc, culturaChartData, 'Alinhamento Cultural', options);
      
      // Adicionar seção de insights usando o método dedicado que agora usa o DiagnosticService
      if (usingWordPressData) {
        // Usar dados das análises enviadas pelo WordPress
        console.log('Gerando insights a partir dos dados enviados pelo WordPress');
        this.generateInsightsPageFromWordPress(doc, iaChartData, culturaChartData, options, formData);
      } else {
        // Usar o DiagnosticService para gerar as análises
        console.log('Gerando insights usando DiagnosticService do microserviço');
        this.generateInsightsPage(doc, iaChartData, culturaChartData, options);
      }
      
      // Finalizar o documento
      doc.end();
      
      return stream;
    } catch (error) {
      console.error('Erro ao gerar PDF de diagnóstico:', error);
      stream.emit('error', error);
      return stream;
    }
  }
  
  /**
   * Gera a página de insights baseada nos dados recebidos diretamente do WordPress
   */
  private generateInsightsPageFromWordPress(
    doc: any, 
    iaChartData: RadarChartData, 
    culturaChartData: RadarChartData, 
    options: PdfOptions,
    formData: Record<string, any>
  ): void {
    // Calcular pontuações
    const iaScore = this.calculateScore(iaChartData);
    const culturaScore = this.calculateScore(culturaChartData);
    
    // Garantir que as pontuações foram passadas ou calculadas
    const finalIaScore = options?.iaScore || iaScore;
    const finalCulturaScore = options?.culturaScore || culturaScore;
    
    // Obter níveis do formData (enviados pelo WordPress)
    const iaLevel = formData._ia_level || options?.iaLevel || this.diagnosticService.getIALevelText(finalIaScore);
    const culturaLevel = formData._cultura_level || options?.culturaLevel || this.diagnosticService.getCulturaLevelText(finalCulturaScore);
    
    // Texto do diagnóstico combinado
    const diagnosticText = formData._combined_analysis || 
                          options?.diagnosticText || 
                          this.diagnosticService.analyze(finalIaScore, finalCulturaScore);
    
    // Obter recomendações do WordPress, se disponíveis
    const recommendations = formData._recommendations || this.diagnosticService.getRecommendationText(finalIaScore, finalCulturaScore);
    
    // Obter significado para a empresa, se disponível
    const companyMeaning = formData._company_meaning || this.diagnosticService.getCompanyMeaning(finalIaScore, finalCulturaScore);

    // Adicionar nova página para insights
    doc.addPage();
    
    // Título dos insights
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1E2A4A')
       .text('Diagnóstico e Insights', { align: 'center' })
       .moveDown(0.5);
    
    // Mostrar níveis de maturidade
    doc.fontSize(14)
       .text('Níveis de Maturidade', { align: 'left' })
       .moveDown(0.5);
    
    // Desenhar tabela de níveis
    const startY = doc.y;
    
    // Desenhar célula de cabeçalho para IA
    doc.rect(doc.x, startY, 150, 25)
       .fill('#1E2A4A');
    
    doc.fillColor('white')
       .text('Maturidade em IA', doc.x + 5, startY + 7);
    
    // Desenhar célula com o nível de IA
    doc.rect(doc.x + 150, startY, 150, 25)
       .fill('#E6EFF7');
    
    const iaLevelColor = finalIaScore >= 34 ? '#006400' : // Verde para nível alto
                      finalIaScore >= 27 ? '#4682B4' : // Azul para nível bom
                      finalIaScore >= 18 ? '#FF8C00' : // Laranja para nível médio
                      '#DC143C'; // Vermelho para nível baixo
    
    doc.fillColor(iaLevelColor)
       .font('Helvetica-Bold')
       .text(`${iaLevel} (${finalIaScore} pts)`, doc.x + 155, startY + 7);
    
    // Desenhar célula de cabeçalho para Cultura
    doc.rect(doc.x, startY + 25, 150, 25)
       .fill('#1E2A4A');
    
    doc.fillColor('white')
       .text('Alinhamento Cultural', doc.x + 5, startY + 32);
    
    // Desenhar célula com o nível de cultura
    doc.rect(doc.x + 150, startY + 25, 150, 25)
       .fill('#E6EFF7');
    
    const culturaLevelColor = finalCulturaScore >= 34 ? '#006400' : // Verde para nível alto
                           finalCulturaScore >= 27 ? '#4682B4' : // Azul para nível bom
                           finalCulturaScore >= 18 ? '#FF8C00' : // Laranja para nível médio
                           '#DC143C'; // Vermelho para nível baixo
    
    doc.fillColor(culturaLevelColor)
       .text(`${culturaLevel} (${finalCulturaScore} pts)`, doc.x + 155, startY + 32);
    
    doc.moveDown(2);
    
    // Mostrar diagnóstico combinado
    doc.fillColor('#1E2A4A')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Diagnóstico Combinado', { align: 'left' })
       .moveDown(0.5);
    
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#333333')
       .text(diagnosticText, { align: 'justify' })
       .moveDown(1.5);
       
    // Verificar se temos companyMeaning para adicionar
    if (companyMeaning && Array.isArray(companyMeaning) && companyMeaning.length > 0) {
      doc.fillColor('#1E2A4A')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('O que isso significa para sua empresa', { align: 'left' })
         .moveDown(0.5);
      
      companyMeaning.forEach((paragraph: string) => {
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#333333')
           .text(paragraph, { align: 'justify' })
           .moveDown(1);
      });
    }
    
    // Mostrar recomendações - usar dados do WordPress
    doc.fillColor('#1E2A4A')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Pontos Fortes', { align: 'left' })
       .moveDown(0.5);
    
    // Listar pontos fortes
    const pontosFortes = recommendations.pontos_fortes || [];
    pontosFortes.forEach((ponto: string) => {
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`• ${ponto}`, { align: 'left', indent: 10 })
         .moveDown(0.5);
    });
    
    doc.moveDown(0.5);
    
    // Áreas de melhoria
    doc.fillColor('#1E2A4A')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Áreas de Melhoria', { align: 'left' })
       .moveDown(0.5);
    
    // Listar áreas de melhoria
    const areasMelhoria = recommendations.areas_melhoria || [];
    areasMelhoria.forEach((area: string) => {
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`• ${area}`, { align: 'left', indent: 10 })
         .moveDown(0.5);
    });
    
    doc.moveDown(0.5);
    
    // Recomendações específicas
    doc.fillColor('#1E2A4A')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Recomendações', { align: 'left' })
       .moveDown(0.5);
    
    // Listar recomendações
    const recomendacoes = recommendations.recomendacoes || [];
    recomendacoes.forEach((rec: string) => {
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`• ${rec}`, { align: 'left', indent: 10 })
         .moveDown(0.5);
    });
    
    if (!pontosFortes.length && !areasMelhoria.length && !recomendacoes.length) {
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#333333')
         .text('Dados insuficientes para gerar recomendações específicas.', { align: 'left' })
         .moveDown(0.5);
    }
    
    // Adicionar seção para visualização das respostas individuais
    this.addResponseDetailsPage(doc, formData);
  }
  
  /**
   * Adiciona uma página com detalhes das respostas do formulário
   */
  private addResponseDetailsPage(doc: any, formData: Record<string, any>): void {
    // Pular se não temos dados de respostas específicas
    if (!formData || (!formData._ia_question_1_text && !formData.pergunta_1)) {
      return;
    }
    
    // Adicionar nova página
    doc.addPage();
    
    // Título
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1E2A4A')
       .text('Detalhes da Avaliação', { align: 'center' })
       .moveDown(1);
    
    // Seção de IA
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1E2A4A')
       .text('Maturidade em IA', { align: 'left' })
       .moveDown(0.5);
    
    // Tabela para cada pergunta
    const questoes_ia = [
      'Uso de IA',
      'Abrangência',
      'Desafios',
      'Benefícios',
      'Avaliação de tecnologias',
      'Escalabilidade',
      'Integração com processos',
      'Capacitação',
      'Investimento',
      'Visão estratégica'
    ];
    
    for (let i = 1; i <= 10; i++) {
      const pergunta = questoes_ia[i-1];
      const resposta_texto = formData[`_ia_question_${i}_text`] || formData[`pergunta_${i}_texto`] || formData[`pergunta_${i}`] || 'Não informado';
      const valor = formData[`_ia_values`] ? formData[`_ia_values`][i-1] : 
                    formData[`pergunta_${i}`] && !isNaN(Number(formData[`pergunta_${i}`])) ? 
                    Number(formData[`pergunta_${i}`]) : 'N/A';
      
      // Desenhar cabeçalho da pergunta
      doc.rect(doc.x, doc.y, 400, 20)
         .fill('#1E2A4A');
      
      doc.fillColor('white')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(`${i}. ${pergunta}`, doc.x + 5, doc.y - 15);
      
      doc.moveDown(0.3);
      
      // Desenhar resposta
      doc.rect(doc.x, doc.y, 400, 30)
         .fill('#E6EFF7');
      
      doc.fillColor('#333333')
         .fontSize(10)
         .font('Helvetica')
         .text(`Resposta: ${resposta_texto} (Valor: ${valor})`, doc.x + 5, doc.y - 25);
      
      doc.moveDown(0.8);
    }
    
    // Verificar se tem espaço suficiente para a seção de cultura
    if (doc.y > 650) {
      doc.addPage();
    } else {
      doc.moveDown(1);
    }
    
    // Seção de Cultura
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1E2A4A')
       .text('Alinhamento Cultural', { align: 'left' })
       .moveDown(0.5);
    
    // Tabela para cada pergunta de cultura
    const questoes_cultura = [
      'Mudanças',
      'Engajamento',
      'Colaboração',
      'Experimentação',
      'Liderança',
      'Comunicação',
      'Capacitação',
      'Reconhecimento',
      'Cultura de feedback',
      'Alinhamento estratégico'
    ];
    
    for (let i = 1; i <= 10; i++) {
      const pergunta = questoes_cultura[i-1];
      const pergunta_num = i + 10; // pergunta_11 a pergunta_20
      const resposta_texto = formData[`_cultura_question_${i}_text`] || 
                             formData[`pergunta_${pergunta_num}_texto`] || 
                             formData[`pergunta_${pergunta_num}`] || 'Não informado';
      const valor = formData[`_cultura_values`] ? formData[`_cultura_values`][i-1] : 
                    formData[`pergunta_${pergunta_num}`] && !isNaN(Number(formData[`pergunta_${pergunta_num}`])) ? 
                    Number(formData[`pergunta_${pergunta_num}`]) : 'N/A';
      
      // Adicionar nova página se necessário
      if (doc.y > 780) {
        doc.addPage();
      }
      
      // Desenhar cabeçalho da pergunta
      doc.rect(doc.x, doc.y, 400, 20)
         .fill('#1E2A4A');
      
      doc.fillColor('white')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(`${i}. ${pergunta}`, doc.x + 5, doc.y - 15);
      
      doc.moveDown(0.3);
      
      // Desenhar resposta
      doc.rect(doc.x, doc.y, 400, 30)
         .fill('#E6EFF7');
      
      doc.fillColor('#333333')
         .fontSize(10)
         .font('Helvetica')
         .text(`Resposta: ${resposta_texto} (Valor: ${valor})`, doc.x + 5, doc.y - 25);
      
      doc.moveDown(0.8);
    }
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
  public getIADiagnosticText(score: number, level: string): string {
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
  public getCultureDiagnosticText(score: number, level: string): string {
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
  public getRecommendationsForCombination(iaLevel: string, culturaLevel: string): any {
    // Estrutura padrão
    const recommendations = {
      pontosFortes: [] as string[],
      areasMelhoria: [] as string[],
      recomendacoes: [] as string[]
    };

    const combinedKey = `${iaLevel}/${culturaLevel}`;

    // Adicionar recomendações específicas baseadas na combinação
    // Implementação simplificada para o exemplo
    if (combinedKey.includes('Tradicional')) {
      recommendations.pontosFortes.push('Processos tradicionais bem estabelecidos.');
      recommendations.areasMelhoria.push('Necessidade de modernização tecnológica.');
      recommendations.recomendacoes.push('Iniciar projetos piloto de IA em áreas estratégicas.');
    }

    if (combinedKey.includes('Visionária')) {
      recommendations.pontosFortes.push('Adoção avançada de tecnologias de IA.');
      recommendations.areasMelhoria.push('Manter-se na vanguarda das inovações.');
      recommendations.recomendacoes.push('Consolidar centro de excelência em IA na organização.');
    }

    if (combinedKey.includes('Alta Resistência')) {
      recommendations.pontosFortes.push('Estrutura organizacional estável.');
      recommendations.areasMelhoria.push('Necessidade de promover cultura de inovação.');
      recommendations.recomendacoes.push('Implementar programas de sensibilização e treinamento em IA.');
    }

    if (combinedKey.includes('Altamente Alinhada')) {
      recommendations.pontosFortes.push('Cultura organizacional favorável à inovação.');
      recommendations.areasMelhoria.push('Aproveitar melhor o potencial da cultura inovadora.');
      recommendations.recomendacoes.push('Expandir programas de inovação aberta e co-criação.');
    }

    return recommendations;
  }

  /**
   * Método para calcular a pontuação total de um gráfico
   */
  private calculateScore(chartData: RadarChartData): number {
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
      return 0;
    }
    
    const data = chartData.datasets[0]?.data || [];
    return data.reduce((sum, val) => sum + (val || 0), 0);
  }

  /**
   * Método para gerar página de insights para o PDF
   */
  private generateInsightsPage(doc: any, iaChartData: RadarChartData, culturaChartData: RadarChartData, options: PdfOptions): void {
    // Calcular pontuações
    const iaScore = this.calculateScore(iaChartData);
    const culturaScore = this.calculateScore(culturaChartData);
    
    // Obter insights e análises via DiagnosticService
    const insights = this.diagnosticService.getDetailedInsights(iaScore, culturaScore);
    const recommendations = this.diagnosticService.getRecommendationText(iaScore, culturaScore);
    
    // Adicionar página com conteúdo
    doc.addPage();
    
    // Título da página
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1E2A4A')
       .text('Análise de Diagnóstico', { align: 'center' })
       .moveDown(1);
       
    // Exibir resultados da análise
    doc.fontSize(14)
       .text('Resultados da Análise', { align: 'left' })
       .moveDown(0.5);
       
    // Exibir texto da análise
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#333333')
       .text(insights.diagnostic_text, { align: 'justify' })
       .moveDown(1.5);
       
    // Exibir recomendações
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1E2A4A')
       .text('Recomendações', { align: 'left' })
       .moveDown(0.5);
       
    // Listar recomendações
    recommendations.recomendacoes.forEach((rec: string) => {
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#333333')
         .text(`• ${rec}`, { align: 'left', indent: 10 })
         .moveDown(0.5);
    });
  }

  /**
   * Gera um PDF com gráfico radar
   * @param chartData Dados para o gráfico radar
   * @param options Opções de configuração do PDF
   * @returns Stream legível contendo o PDF gerado
   */
  public async generateChartPdf(chartData: RadarChartData, options: PdfOptions = {}): Promise<Readable> {
    // Configurar o stream de resposta
    const stream = new Readable({
      read() {
        // Implementação vazia pois preenchemos o stream após o PDF ser gerado
      }
    });
    
    try {
      console.log('Iniciando geração de PDF com gráfico radar');
      
      // Gerar PDF com PDFKit
      const doc = new PDFDocument({
        size: options.pageSize || 'A4',
        layout: options.pageOrientation || 'portrait',
        margins: {
          top: 30,
          bottom: 30,
          left: 40,
          right: 40
        },
        bufferPages: true,
        info: {
          Title: options.title || 'Gráfico Radar',
          Author: options.author || 'Sistema de Gráficos',
          Subject: options.subject || 'Gráfico Radar em PDF',
          Keywords: options.keywords || 'gráfico, radar, análise'
        }
      });
      
      // Configurar o WritableBufferStream para capturar todo o conteúdo
      const bufferStream = new WritableBufferStream((pdfBuffer) => {
        stream.push(pdfBuffer);
        stream.push(null); // Finalizar o stream
      });
      
      // Pipe do doc para o buffer stream
      doc.pipe(bufferStream);
      
      // Adicionar título ao PDF, se fornecido
      if (options.title) {
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text(options.title, { align: 'center' })
           .moveDown(0.5);
      }
      
      // Preparar canvas para o gráfico
      const chartWidth = chartData.width || 500;
      const chartHeight = chartData.height || 400;
      const canvas = createCanvas(chartWidth, chartHeight);
      
      // Desenhar gráfico no canvas
      this.chartService.generateRadarChart(canvas, {
        ...chartData,
        width: chartWidth,
        height: chartHeight
      });
      
      // Centralizar o gráfico na página
      const x = (doc.page.width - chartWidth) / 2;
      
      // Adicionar o gráfico ao PDF
      doc.image(canvas.toBuffer(), x, doc.y, {
        width: chartWidth,
        height: chartHeight
      });
      
      // Finalizar o documento
      doc.end();
      
      return stream;
    } catch (error) {
      console.error('Erro ao gerar PDF com gráfico radar:', error);
      stream.emit('error', error);
      return stream;
    }
  }
}