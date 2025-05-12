import { Request, Response } from 'express';
import { FormService } from '../services/form.service';
import { ChartController } from './chart.controller';
import { QueueService, QueueType } from '../services/queue.service';

export class FormController {
    private formService: FormService;
    private chartController: ChartController;
    private queueService: QueueService;

    constructor() {
        this.formService = new FormService();
        this.chartController = new ChartController();
        this.queueService = QueueService.getInstance();
    }

    async processFormData(req: Request, res: Response) {
        try {
            console.log('Recebendo requisição no FormController.processFormData');
            
            // Log detalhado
            console.log('Body recebido:', JSON.stringify(req.body, null, 2));
            
            const { formData, iaChartData, culturaChartData, pdfOptions, useQueue } = req.body;
            
            if (!formData) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados do formulário não fornecidos'
                });
            }

            // IMPORTANTE: Verificar se existem valores diretos enviados pelo WordPress
            let iaScore = pdfOptions?.iaScore;
            let culturaScore = pdfOptions?.culturaScore;
            let iaLevel = pdfOptions?.iaLevel;
            let culturaLevel = pdfOptions?.culturaLevel;
            
            // Verificar se temos valores explícitos nos dados do formulário
            if (formData._ia_score && formData._cultura_score) {
                console.log('Usando valores explícitos do formulário:', formData._ia_score, formData._cultura_score);
                iaScore = formData._ia_score;
                culturaScore = formData._cultura_score;
            } else if (formData.numeric_field_1 && formData.numeric_field_2) {
                console.log('Usando valores dos campos numéricos:', formData.numeric_field_1, formData.numeric_field_2);
                iaScore = Number(formData.numeric_field_1);
                culturaScore = Number(formData.numeric_field_2);
            }

            // Recalcular níveis se necessário
            if (iaScore && !iaLevel) {
                iaLevel = this.getIALevel(iaScore);
            }
            
            if (culturaScore && !culturaLevel) {
                culturaLevel = this.getCulturaLevel(culturaScore);
            }

            // Atualizar options do PDF
            if (pdfOptions) {
                pdfOptions.iaScore = iaScore || pdfOptions.iaScore;
                pdfOptions.culturaScore = culturaScore || pdfOptions.culturaScore;
                pdfOptions.iaLevel = iaLevel || pdfOptions.iaLevel;
                pdfOptions.culturaLevel = culturaLevel || pdfOptions.culturaLevel;
            }

            // Processa os dados do formulário e gera as variações
            const result = await this.formService.processFormData({ 
                ...formData,
                // Converter textos para valores numéricos
                pergunta_1: this.mapTextToNumber(formData.pergunta_1),
                pergunta_2: this.mapTextToNumber(formData.pergunta_2),
                pergunta_3: this.mapTextToNumber(formData.pergunta_3),
                pergunta_4: this.mapTextToNumber(formData.pergunta_4),
                pergunta_5: this.mapTextToNumber(formData.pergunta_5),
                pergunta_6: this.mapTextToNumber(formData.pergunta_6),
                pergunta_7: this.mapTextToNumber(formData.pergunta_7),
                pergunta_8: this.mapTextToNumber(formData.pergunta_8),
                pergunta_9: this.mapTextToNumber(formData.pergunta_9),
                pergunta_10: this.mapTextToNumber(formData.pergunta_10),
                pergunta_11: this.mapTextToNumber(formData.pergunta_11),
                pergunta_12: this.mapTextToNumber(formData.pergunta_12),
                pergunta_13: this.mapTextToNumber(formData.pergunta_13),
                pergunta_14: this.mapTextToNumber(formData.pergunta_14),
                pergunta_15: this.mapTextToNumber(formData.pergunta_15),
                pergunta_16: this.mapTextToNumber(formData.pergunta_16),
                pergunta_17: this.mapTextToNumber(formData.pergunta_17),
                pergunta_18: this.mapTextToNumber(formData.pergunta_18),
                pergunta_19: this.mapTextToNumber(formData.pergunta_19),
                pergunta_20: this.mapTextToNumber(formData.pergunta_20),
                submission_id: formData.submission_id || 0,
                empresa: formData.empresa || pdfOptions?.company || 'Empresa'
            });
            
            console.log('Scores calculados pelo FormService:', result.scores);
            
            // Se temos scores explícitos, vamos usá-los em vez dos calculados
            if (iaScore && culturaScore) {
                console.log('Substituindo scores calculados por valores explícitos:', iaScore, culturaScore);
                result.scores.ia = iaScore;
                result.scores.cultura = culturaScore;
                result.levels.ia = iaLevel || this.getIALevel(iaScore);
                result.levels.cultura = culturaLevel || this.getCulturaLevel(culturaScore);
            }
            
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
                console.log('Gerando PDF para a solicitação com scores:', result.scores.ia, result.scores.cultura);
                
                const pdfRequestData = {
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
                        company: formData.empresa || pdfOptions?.company || 'Empresa'
                    }
                };
                
                // Verificar se devemos usar o sistema de filas
                if (useQueue === true) {
                    // Adicionar o job à fila
                    const job = await this.queueService.addJob(QueueType.PDF_GENERATION, {
                        formData,
                        ...pdfRequestData,
                        callbackUrl: req.body.callbackUrl || null
                    });
                    
                    return res.status(202).json({
                        success: true,
                        message: 'Solicitação de geração de PDF adicionada à fila',
                        jobId: job.id,
                        queueName: QueueType.PDF_GENERATION,
                        statusUrl: `/api/queue/${QueueType.PDF_GENERATION}/jobs/${job.id}`
                    });
                } else {
                    // Processamento síncrono (comportamento original)
                    // Modificar o corpo da requisição atual
                    req.body = pdfRequestData;
                    
                    // Gerar o PDF usando o chartController
                    return this.chartController.generateDiagnosticPdf(req, res);
                }
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
            const iaScore = this.formService.calculateIAScore({
                ...formData,
                pergunta_1: this.mapTextToNumber(formData.pergunta_1),
                pergunta_2: this.mapTextToNumber(formData.pergunta_2),
                pergunta_3: this.mapTextToNumber(formData.pergunta_3),
                pergunta_4: this.mapTextToNumber(formData.pergunta_4),
                pergunta_5: this.mapTextToNumber(formData.pergunta_5),
                pergunta_6: this.mapTextToNumber(formData.pergunta_6),
                pergunta_7: this.mapTextToNumber(formData.pergunta_7),
                pergunta_8: this.mapTextToNumber(formData.pergunta_8),
                pergunta_9: this.mapTextToNumber(formData.pergunta_9),
                pergunta_10: this.mapTextToNumber(formData.pergunta_10),
                submission_id: formData.submission_id || 0,
                empresa: formData.empresa || 'Empresa',
                pergunta_11: 0,
                pergunta_12: 0,
                pergunta_13: 0,
                pergunta_14: 0,
                pergunta_15: 0,
                pergunta_16: 0,
                pergunta_17: 0,
                pergunta_18: 0,
                pergunta_19: 0,
                pergunta_20: 0
            });
            
            const culturaScore = this.formService.calculateCulturaScore({
                ...formData,
                pergunta_1: 0,
                pergunta_2: 0,
                pergunta_3: 0,
                pergunta_4: 0,
                pergunta_5: 0,
                pergunta_6: 0,
                pergunta_7: 0,
                pergunta_8: 0,
                pergunta_9: 0,
                pergunta_10: 0,
                pergunta_11: this.mapTextToNumber(formData.pergunta_11),
                pergunta_12: this.mapTextToNumber(formData.pergunta_12),
                pergunta_13: this.mapTextToNumber(formData.pergunta_13),
                pergunta_14: this.mapTextToNumber(formData.pergunta_14),
                pergunta_15: this.mapTextToNumber(formData.pergunta_15),
                pergunta_16: this.mapTextToNumber(formData.pergunta_16),
                pergunta_17: this.mapTextToNumber(formData.pergunta_17),
                pergunta_18: this.mapTextToNumber(formData.pergunta_18),
                pergunta_19: this.mapTextToNumber(formData.pergunta_19),
                pergunta_20: this.mapTextToNumber(formData.pergunta_20),
                submission_id: formData.submission_id || 0,
                empresa: formData.empresa || 'Empresa'
            });
            
            // Usar valores explícitos se disponíveis
            const finalIaScore = formData._ia_score || iaScore;
            const finalCulturaScore = formData._cultura_score || culturaScore;
            
            console.log('Gerando variações com scores:', finalIaScore, finalCulturaScore);
            
            // Gera variações baseadas nos scores
            const variations = await this.formService.generateVariations({ 
                ...formData,
                pergunta_1: this.mapTextToNumber(formData.pergunta_1),
                pergunta_2: this.mapTextToNumber(formData.pergunta_2),
                pergunta_3: this.mapTextToNumber(formData.pergunta_3),
                pergunta_4: this.mapTextToNumber(formData.pergunta_4),
                pergunta_5: this.mapTextToNumber(formData.pergunta_5),
                pergunta_6: this.mapTextToNumber(formData.pergunta_6),
                pergunta_7: this.mapTextToNumber(formData.pergunta_7),
                pergunta_8: this.mapTextToNumber(formData.pergunta_8),
                pergunta_9: this.mapTextToNumber(formData.pergunta_9),
                pergunta_10: this.mapTextToNumber(formData.pergunta_10),
                pergunta_11: this.mapTextToNumber(formData.pergunta_11),
                pergunta_12: this.mapTextToNumber(formData.pergunta_12),
                pergunta_13: this.mapTextToNumber(formData.pergunta_13),
                pergunta_14: this.mapTextToNumber(formData.pergunta_14),
                pergunta_15: this.mapTextToNumber(formData.pergunta_15),
                pergunta_16: this.mapTextToNumber(formData.pergunta_16),
                pergunta_17: this.mapTextToNumber(formData.pergunta_17),
                pergunta_18: this.mapTextToNumber(formData.pergunta_18),
                pergunta_19: this.mapTextToNumber(formData.pergunta_19),
                pergunta_20: this.mapTextToNumber(formData.pergunta_20),
                submission_id: formData.submission_id || 0,
                empresa: formData.empresa || 'Empresa'
            });
            
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

    // Método para mapear texto para valor numérico
    private mapTextToNumber(textValue: string): number {
        if (!textValue) return 1;

        // Mapeamento de textos para valores numéricos
        const valueMap: Record<string, number> = {
            // Nível 1 (pior cenário)
            'Não utiliza e não tem planos': 1,
            'Nenhuma área': 1,
            'Falta de interesse ou conhecimento': 1,
            'Não há nenhum projeto de IA aplicado': 1,
            'Sem processo definido': 1,
            'Sem planos de expansão': 1,
            'Totalmente desconectada': 1,
            'Nenhuma capacitação': 1,
            'Investimento inexistente ou insignificante': 1,
            'Não é considerada na estratégia': 1,
            'Evita mudanças': 1,
            'Não participam': 1,
            'Ambiente competitivo e individualista': 1,
            'Erros são penalizados': 1,
            'Não há incentivo': 1,
            'Comunicação inexistente ou ineficaz': 1,
            'Não investe': 1,
            'Não há reconhecimento': 1,
            'Feedback ausente ou negativo': 1,
            'Desconexão total': 1,
            
            // Nível 2
            'Utiliza em iniciativas pontuais': 2,
            '1 ou 2 áreas': 2,
            'Questões culturais ou organizacionais': 2,
            'Resultados limitados ou inconclusivos': 2,
            'Processo informal e reativo': 2,
            'Potencial de crescimento limitado': 2,
            'Pontos isolados de integração': 2,
            'Capacitação limitada e informal': 2,
            'Investimento ocasional e não estruturado': 2,
            'Considerada de forma pontual': 2,
            'Aceita mudanças com resistência': 2,
            'Participação limitada': 2,
            'Algumas tentativas de colaboração': 2,
            'Tolera erros, mas com consequências': 2,
            'Incentivos esporádicos': 2,
            'Comunicação esporádica': 2,
            'Investimento mínimo e pontual': 2,
            'Reconhecimento ocasional': 2,
            'Feedback informal e esporádico': 2,
            'Alinhamento mínimo': 2,
            
            // Nível 3
            'Implementação estruturada em algumas áreas': 3,
            '3 ou 4 áreas': 3,
            'Dificuldade técnica ou de integração': 3,
            'Melhoria operacional perceptível': 3,
            'Processo planejado, mas não otimizado': 3,
            'Potencial de crescimento moderado': 3,
            'Integrada em áreas-chave': 3,
            'Treinamentos periódicos e direcionados': 3,
            'Investimento regular, mas moderado': 3,
            'Presente em alguns planos estratégicos': 3,
            'Abraça mudanças de forma proativa': 3,
            'Participação de alguns colaboradores': 3,
            'Ambiente colaborativo com restrições': 3,
            'Vê os erros como oportunidades de aprendizado': 3,
            'Incentivo moderado': 3,
            'Comunicação regular, mas não sistemática': 3,
            'Investimento robusto e contínuo': 3,
            'Reconhecimento em áreas específicas': 3,
            'Feedback regular, mas não estruturado': 3,
            'Alinhamento parcial': 3,
            
            // Nível 4 (melhor cenário)
            'Utiliza de forma estruturada e estratégica em diversas áreas': 4,
            '5 ou mais áreas': 4,
            'Questões de investimento e custo elevado': 4,
            'Impacto estratégico e financeiro comprovado': 4,
            'Processo estratégico e estruturado': 4,
            'Alta capacidade de expansão e integração': 4,
            'Integração completa e sistêmica': 4,
            'Programa abrangente de capacitação': 4,
            'Investimento significativo e planejado': 4,
            'Parte integral da estratégia corporativa': 4,
            'Considera a mudança parte da cultura': 4,
            'Envolvimento amplo e estruturado': 4,
            'Cultura de colaboração como prioridade': 4,
            'Cultura que incentiva a experimentação': 4,
            'Forte incentivo estruturado': 4,
            'Comunicação fluida e sistêmica': 4,
            'Investimento prioritário e estratégico': 4,
            'Reconhecimento consistente e estruturado': 4,
            'Sistema formal de feedback contínuo': 4,
            'Alinhamento total e integrado': 4
        };

        // Buscar valor exato
        if (valueMap[textValue]) {
            return valueMap[textValue];
        }

        // Buscar correspondência parcial
        for (const [key, value] of Object.entries(valueMap)) {
            if (textValue.includes(key)) {
                return value;
            }
        }

        // Detecção baseada em palavras-chave comuns
        const lowerText = textValue.toLowerCase();
        if (lowerText.includes('não') || lowerText.includes('nenhum') || lowerText.includes('inexistente')) {
            return 1;
        } else if (lowerText.includes('limitad') || lowerText.includes('ocasional') || lowerText.includes('pontual')) {
            return 2;
        } else if (lowerText.includes('estrutura') || lowerText.includes('completa') || lowerText.includes('integral')) {
            return 4;
        } else if (lowerText.includes('algumas') || lowerText.includes('moderado') || lowerText.includes('regular')) {
            return 3;
        }

        // Valor padrão
        return 2;
    }

    // Obtém o nível de IA com base na pontuação
    private getIALevel(score: number): string {
        if (score < 18) return 'Tradicional';
        if (score < 27) return 'Exploradora';
        if (score < 34) return 'Inovadora';
        return 'Visionária';
    }

    // Obtém o nível de cultura com base na pontuação
    private getCulturaLevel(score: number): string {
        if (score < 18) return 'Alta Resistência';
        if (score < 27) return 'Moderadamente Aberta';
        if (score < 34) return 'Favorável';
        return 'Altamente Alinhada';
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