import { Request, Response } from 'express';
import { FormService } from '../services/form.service';
import { ChartController } from './chart.controller';

export class FormController {
    private formService: FormService;
    private chartController: ChartController;

    constructor() {
        this.formService = new FormService();
        this.chartController = new ChartController();
    }

    async processFormData(req: Request, res: Response) {
        try {
            console.log('Recebendo requisição no FormController.processFormData');
            console.log('Body recebido:', JSON.stringify(req.body, null, 2));
            
            const { formData, iaChartData, culturaChartData, pdfOptions } = req.body;
            
            if (!formData) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados do formulário não fornecidos'
                });
            }

            // Processa os dados do formulário e gera as variações
            const result = await this.formService.processFormData(formData);
            
            // Adiciona os dados dos gráficos e opções do PDF ao resultado
            const finalResult = {
                ...result,
                charts: {
                    ia: iaChartData,
                    cultura: culturaChartData
                },
                pdfOptions
            };

            // Se a request foi feita para a rota /api/diagnostic-pdf, gera o PDF
            if (req.path === '/api/diagnostic-pdf' || req.originalUrl === '/api/diagnostic-pdf') {
                console.log('Gerando PDF para a solicitação...');
                
                // Modificar o corpo da requisição atual em vez de criar uma nova
                req.body = {
                    iaChartData: iaChartData || this.createDefaultChartData(result.scores.ia, 'ia'),
                    culturaChartData: culturaChartData || this.createDefaultChartData(result.scores.cultura, 'cultura'),
                    pdfOptions: {
                        ...pdfOptions,
                        title: `Diagnóstico de IA e Cultura - ${formData.empresa || 'Empresa'}`,
                        fileName: `diagnostico-ia-cultura-${Date.now()}.pdf`,
                        iaScore: result.scores.ia,
                        culturaScore: result.scores.cultura,
                        iaLevel: result.levels.ia,
                        culturaLevel: result.levels.cultura,
                        company: formData.empresa
                    }
                };
                
                // Gerar o PDF usando o chartController
                return this.chartController.generateDiagnosticPdf(req, res);
            }
            
            // Se não for uma solicitação de PDF, retorna o JSON com os resultados
            res.status(200).json({
                success: true,
                data: finalResult
            });
        } catch (error) {
            console.error('Erro ao processar dados do formulário:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao processar dados do formulário',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    async generateVariations(req: Request, res: Response) {
        try {
            const { formData } = req.body;
            
            if (!formData) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados do formulário não fornecidos'
                });
            }

            // Calcula os scores
            const iaScore = this.formService.calculateIAScore(formData);
            const culturaScore = this.formService.calculateCulturaScore(formData);
            
            // Gera variações baseadas nos scores
            const variations = await this.formService.generateVariations(formData, iaScore, culturaScore);
            
            res.status(200).json({
                success: true,
                data: variations
            });
        } catch (error) {
            console.error('Erro ao gerar variações:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao gerar variações',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    // Cria dados de gráfico padrão se não forem fornecidos
    private createDefaultChartData(score: number, type: 'ia' | 'cultura') {
        const labels = type === 'ia' 
            ? ['Adoção', 'Áreas', 'Desafios', 'Resultados', 'Processo', 'Escalabilidade', 'Integração', 'Capacitação', 'Investimento', 'Estratégia']
            : ['Abertura', 'Envolvimento', 'Colaboração', 'Aprendizado', 'Incentivo', 'Comunicação', 'Investimento', 'Reconhecimento', 'Feedback', 'Alinhamento'];
        
        // Criar valores padrão baseados no score (dividido igualmente entre os 10 itens)
        const individualValue = score / 10;
        const data = new Array(10).fill(individualValue);
        
        return {
            labels,
            datasets: [{
                label: type === 'ia' ? 'Maturidade em IA' : 'Alinhamento Cultural',
                data,
                backgroundColor: type === 'ia' ? 'rgba(54, 162, 235, 0.2)' : 'rgba(255, 99, 132, 0.2)',
                borderColor: type === 'ia' ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                pointBackgroundColor: type === 'ia' ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
                pointBorderColor: '#fff',
                pointRadius: 3,
                fill: true
            }],
            width: 400,
            height: 400
        };
    }
} 