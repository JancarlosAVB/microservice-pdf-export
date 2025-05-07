import { Request, Response } from 'express';
import { PdfService } from '../services/pdf.service';
import { ChartRequest, DiagnosticChartRequest } from '../interfaces/chart.interface';

export class ChartController {
  private pdfService: PdfService;

  /**
   * Endpoint para retornar análise completa do relatório (JSON)
   */
  public async getDiagnosticReport(req: Request, res: Response): Promise<void> {
    try {
      const submissionId = req.params.submission_id;
      // Simulação de banco: buscar dados do submissionId
      // Substitua por busca real no futuro
      const submissionsDb = require('../../test-diagnostico.json');
      const submission = submissionsDb[submissionId];
      if (!submission) {
        res.status(404).json({ success: false, message: 'Submissão não encontrada.' });
        return;
      }
      // Processar os dados do formulário
      const iaLabels = submission.iaChartData?.labels || [];
      const culturaLabels = submission.culturaChartData?.labels || [];
      const iaValues = this.processFormData(submission.formData, 'pergunta_ia_', iaLabels);
      const culturaValues = this.processFormData(submission.formData, 'pergunta_cultura_', culturaLabels);
      // Calcular scores e níveis
      const iaScore = iaValues.reduce((sum, v) => sum + (v || 0), 0);
      const culturaScore = culturaValues.reduce((sum, v) => sum + (v || 0), 0);
      const iaLevel = this.pdfService['calculateMaturityLevel'](iaScore);
      const culturaLevel = this.pdfService['calculateCultureLevel'](culturaScore);
      // Insights dinâmicos (exemplo: pode ser expandido com lógica real)
      const insights: string[] = [
        this.pdfService.getIADiagnosticText(iaScore, iaLevel),
        this.pdfService.getCultureDiagnosticText(culturaScore, culturaLevel)
      ];
      // Recomendações detalhadas
      const recommendations: { pontosFortes: string[], areasMelhoria: string[], recomendacoes: string[] } = this.pdfService['getRecommendationsForCombination'](iaLevel, culturaLevel);
      const diagnosticText: string = this.pdfService['analyzeCombination'](iaScore, culturaScore)?.diagnostic_text || '';
      res.json({
        success: true,
        ia_score: iaScore,
        cultura_score: culturaScore,
        ia_level: iaLevel,
        cultura_level: culturaLevel,
        insights,
        recommendations,
        diagnostic_text: diagnosticText,
        company: submission.company || '',
        pdf_url: submission.pdf_url || '',
        form_data: submission.formData || {},
        message: ''
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao processar relatório', error: error instanceof Error ? error.message : error });
    }
  }

  constructor() {
    this.pdfService = new PdfService();
  }

  /**
   * Mapeia respostas textuais para valores numéricos entre 1 e 4
   * @param textResponse Resposta textual da pergunta
   * @returns Valor numérico entre 1 e 4
   */
  private mapResponseToValue(textResponse: string): number {
    // Mapeamento de respostas específicas do formulário para valores
    const formResponseMap: Record<string, number> = {
      // Perguntas 1-10 (IA)
      'Não utiliza e não tem planos': 1,
      'Tem interesse, mas ainda não implementou': 2,
      'Utiliza de forma limitada em alguns processos': 3,
      'Utiliza de forma estruturada e estratégica em diversas áreas': 4,
      
      'Nenhuma área': 1,
      '1 a 2 áreas': 2,
      '3 a 4 áreas': 3,
      '5 ou mais áreas': 4,
      
      'Falta de interesse ou conhecimento': 1,
      'Cultura organizacional resistente': 2,
      'Dificuldade técnica ou de integração': 3,
      'Questões de investimento e custo elevado': 4,
      
      'Não há nenhum projeto de IA aplicado': 1,
      'Benefícios iniciais sem impacto estratégico': 2,
      'Melhoria operacional perceptível': 3,
      'Impacto estratégico e financeiro comprovado': 4,
      
      'Sem processo definido': 1,
      'Avaliações pontuais e reativas': 2,
      'Testes-piloto antes da implementação': 3,
      'Processo estratégico e estruturado': 4,
      
      'Sem planos de expansão': 1,
      'Pouca escalabilidade devido a limitações': 2,
      'Potencial de crescimento moderado': 3,
      'Alta capacidade de expansão e integração': 4,
      
      'Totalmente desconectada': 1,
      'Integração incipiente': 2,
      'Integrada em áreas-chave': 3,
      'Integração completa e sistêmica': 4,
      
      'Nenhuma capacitação': 1,
      'Capacitação limitada e informal': 2,
      'Treinamentos periódicos e direcionados': 3,
      'Equipe altamente capacitada e atualizada': 4,
      
      'Investimento inexistente ou insignificante': 1,
      'Investimento pontual (IA)': 2,
      'Investimento regular, mas moderado': 3,
      'Investimento robusto e contínuo (IA)': 4,
      
      'Não é considerada na estratégia': 1,
      'Considerada de forma pontual': 2,
      'Presente em alguns planos estratégicos': 3,
      'Central na estratégia e visão de futuro': 4,
      
      // Perguntas 11-20 (Cultura)
      'Evita mudanças': 1,
      'Aceita mudanças somente quando forçada': 2,
      'Adota mudanças de forma reativa': 3,
      'Abraça mudanças de forma proativa': 4,
      
      'Não participam': 1,
      'Participação mínima ou pontual': 2,
      'Participação de alguns colaboradores': 3,
      'Engajamento amplo e colaborativo': 4,
      
      'Ambiente competitivo e individualista': 1,
      'Algumas iniciativas isoladas': 2,
      'Ambiente colaborativo com restrições': 3,
      'Ambiente fortemente colaborativo e de aprendizado contínuo': 4,
      
      'Erros são penalizados': 1,
      'Experimentação é desencorajada': 2,
      'Aceita experimentação com cautela': 3,
      'Vê os erros como oportunidades de aprendizado': 4,
      
      'Não há incentivo': 1,
      'Incentivos esporádicos': 2,
      'Incentivo moderado': 3,
      'Incentivo contínuo e estruturado': 4,
      
      'Comunicação inexistente ou ineficaz': 1,
      'Comunicação esporádica': 2,
      'Comunicação regular, mas não sistemática': 3,
      'Comunicação fluida e integrada': 4,
      
      'Não investe': 1,
      'Investimento pontual (cultura)': 2,
      'Investimento regular, porém limitado': 3,
      'Investimento robusto e contínuo (cultura)': 4,
      
      'Não há reconhecimento': 1,
      'Reconhecimento eventual': 2,
      'Reconhecimento em áreas específicas': 3,
      'Reconhecimento sistemático e motivador': 4,
      
      'Feedback ausente ou negativo': 1,
      'Feedback informal e esporádico': 2,
      'Feedback regular, mas não estruturado': 3,
      'Feedback contínuo e estruturado': 4,
      
      'Desconexão total': 1,
      'Entendimento limitado': 2,
      'Alinhamento parcial': 3,
      'Total compreensão e engajamento': 4
    };
    
    // Mapeamento de termos genéricos para valores
    const genericResponseMap: Record<string, number> = {
      // Respostas negativas (baixo valor)
      'não utiliza': 1,
      'inexistente': 1,
      'não há': 1,
      'sem': 1,
      'nenhum': 1,
      'ausente': 1,
      'limitado': 1,
      'resistência': 1,
      'básico': 1,
      'resistente': 1,
      'baixo': 1,
      
      // Respostas intermediárias de valor inferior
      'poucos': 2,
      'limitada': 2,
      'pontual': 2,
      'isolada': 2,
      'eventual': 2,
      'parcial': 2,
      'moderado': 2,
      '1 a 2': 2,
      
      // Respostas intermediárias de valor superior
      'algumas': 3,
      'moderadamente': 3,
      'regular': 3,
      'parcialmente': 3,
      '3 a 4': 3,
      'adequado': 3,
      'satisfatório': 3,
      
      // Respostas positivas (alto valor)
      'completa': 4,
      'altamente': 4,
      'alto': 4,
      'excelente': 4,
      'contínuo': 4,
      'estruturado': 4,
      'estratégico': 4,
      'integrada': 4,
      'flúida': 4,
      'proativa': 4,
      'aprendizado': 4,
      'visionaria': 4,
      '+ de 5': 4,
      'mais de 5': 4
    };
    
    // Verificar correspondencias parciais em texto de respostas longas
    if (!textResponse) return 1; // Valor padrão para respostas vazias
    
    // Verificação direta para opções de formulário
    if (formResponseMap[textResponse] !== undefined) {
      console.log(`Mapeamento exato encontrado para '${textResponse}': ${formResponseMap[textResponse]}`);
      return formResponseMap[textResponse];
    }
    
    const lowerText = textResponse.toLowerCase();
    
    // Verificar correspondências exatas nos termos genéricos
    if (genericResponseMap[lowerText]) return genericResponseMap[lowerText];
    
    // Verificar correspondências parciais nos termos genéricos
    for (const [key, value] of Object.entries(genericResponseMap)) {
      if (lowerText.includes(key)) {
        return value;
      }
    }
    
    // Detecções mais específicas baseadas no contexto do log
    if (lowerText.includes('não utiliza') || lowerText.includes('sem')) return 1;
    if (lowerText.includes('tem interesse') || lowerText.includes('forma limitada')) return 2;
    if (lowerText.includes('impacto estratégico') || lowerText.includes('estruturada')) return 4;
    if (lowerText.includes('integração completa')) return 4;
    if (lowerText.includes('capacitada')) return 4;
    if (lowerText.includes('abraça mudanças')) return 4;
    
    console.log(`Não foi possível mapear '${textResponse}', usando valor padrão 2`);
    
    // Valor padrão se não houver correspondência
    return 2;
  }

  /**
   * Processa dados textuais do formulário e converte em dados numéricos para o gráfico
   * @param formData Dados do formulário com respostas textuais
   * @param prefix Prefixo das perguntas (pergunta_ia_, pergunta_cultura_)
   * @param labels Rótulos para o gráfico
   * @returns Dados processados para o gráfico radar
   */
  private processFormData(formData: Record<string, any>, prefix: string, labels: string[]): number[] {
    const values: number[] = [];
    
    console.log(`Processando dados de ${prefix} com ${Object.keys(formData).length} campos no formulário`);
    
    // Extração baseada no tipo de perguntas
    if (prefix === 'ia') {
      // Extrai valores das perguntas 1 a 10 de IA
      for (let i = 1; i <= 10; i++) {
        const key = `pergunta_${i}`;
        console.log(`[IA ${i}] Processando ${key}: ${formData[key] || 'não encontrado'}`);
        
        // Verificar se o valor é um inteiro direto ou texto que precisa ser mapeado
        if (formData[key]) {
          if (typeof formData[key] === 'number' || !isNaN(Number(formData[key]))) {
            // Se for um número ou string numérica, converter diretamente
            const numValue = Number(formData[key]);
            values.push(numValue >= 1 && numValue <= 4 ? numValue : 1);
            console.log(`[IA ${i}] Valor numérico: ${numValue}`);
          } else {
            // Se for texto, mapear para valor
            const mappedValue = this.mapResponseToValue(formData[key]);
            values.push(mappedValue);
            console.log(`[IA ${i}] Texto mapeado: '${formData[key]}' => ${mappedValue}`);
          }
        } else {
          values.push(1); // Valor padrão se a pergunta não for encontrada
          console.log(`[IA ${i}] Não encontrado, usando valor padrão 1`);
        }
      }
    } else if (prefix === 'cultura') {
      // Extrai valores das perguntas 11 a 20 de Cultura
      for (let i = 11; i <= 20; i++) {
        const key = `pergunta_${i}`;
        console.log(`[Cultura ${i-10}] Processando ${key}: ${formData[key] || 'não encontrado'}`);
        
        // Verificar se o valor é um inteiro direto ou texto que precisa ser mapeado
        if (formData[key]) {
          if (typeof formData[key] === 'number' || !isNaN(Number(formData[key]))) {
            // Se for um número ou string numérica, converter diretamente
            const numValue = Number(formData[key]);
            values.push(numValue >= 1 && numValue <= 4 ? numValue : 1);
            console.log(`[Cultura ${i-10}] Valor numérico: ${numValue}`);
          } else {
            // Se for texto, mapear para valor
            const mappedValue = this.mapResponseToValue(formData[key]);
            values.push(mappedValue);
            console.log(`[Cultura ${i-10}] Texto mapeado: '${formData[key]}' => ${mappedValue}`);
          }
        } else {
          values.push(1); // Valor padrão se a pergunta não for encontrada
          console.log(`[Cultura ${i-10}] Não encontrado, usando valor padrão 1`);
        }
      }
    }
    
    // Se não encontramos valores, tentar abordagem alternativa
    if (values.length === 0) {
      // Tentar extrair diretamente do objeto dados
      const data = formData.data || [];
      if (Array.isArray(data) && data.length > 0) {
        return data.map(val => val || 1); // Substituir zeros por um
      }
      
      // Preenchimento com valores mínimos se necessário
      return new Array(labels.length).fill(1);
    }
    
    return values;
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
      let { iaChartData, culturaChartData, pdfOptions } = req.body as DiagnosticChartRequest;
      
      // Se também foi enviado dados de formulário brutos, processá-los
      if (req.body.formData) {
        const formData = req.body.formData;
        console.log('Dados de formulário recebidos:', JSON.stringify(formData, null, 2));
        
        // Processar dados para IA se necessário
        if (iaChartData && iaChartData.datasets && iaChartData.datasets.length > 0) {
          // Usar 'ia' como prefixo para processar perguntas 1-10
          const processedValues = this.processFormData(formData, 'ia', iaChartData.labels || []);
          iaChartData.datasets[0].data = processedValues;
          
          console.log('Valores processados de IA:', processedValues);
        }
        
        // Processar dados para Cultura se necessário
        if (culturaChartData && culturaChartData.datasets && culturaChartData.datasets.length > 0) {
          // Usar 'cultura' como prefixo para processar perguntas 11-20
          const processedValues = this.processFormData(formData, 'cultura', culturaChartData.labels || []);
          culturaChartData.datasets[0].data = processedValues;
          
          console.log('Valores processados de Cultura:', processedValues);
        }
      }
      
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
      
      // Gerar o PDF de diagnostico
      const pdfStream = await this.pdfService.generateDiagnosticPdf(iaChartData, culturaChartData, pdfOptions, req.body.formData);
      
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