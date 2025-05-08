import { Request, Response } from 'express';
import { FormService } from '../services/form.service';

export class FormController {
    private formService: FormService;

    constructor() {
        this.formService = new FormService();
    }

    async processFormData(req: Request, res: Response) {
        try {
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
            
            res.status(200).json({
                success: true,
                data: finalResult
            });
        } catch (error) {
            console.error('Erro ao processar dados do formulário:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao processar dados do formulário'
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
                error: 'Erro ao gerar variações'
            });
        }
    }
} 