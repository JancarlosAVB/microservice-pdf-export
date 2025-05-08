export interface FormData {
    submission_id: number;
    empresa: string;
    // Campos IA
    pergunta_1: number;
    pergunta_2: number;
    pergunta_3: number;
    pergunta_4: number;
    pergunta_5: number;
    pergunta_6: number;
    pergunta_7: number;
    pergunta_8: number;
    pergunta_9: number;
    pergunta_10: number;
    // Campos Cultura
    pergunta_11: number;
    pergunta_12: number;
    pergunta_13: number;
    pergunta_14: number;
    pergunta_15: number;
    pergunta_16: number;
    pergunta_17: number;
    pergunta_18: number;
    pergunta_19: number;
    pergunta_20: number;
}

export interface Variation {
    text: string;
    score: number;
    category: string;
}

export interface LevelRange {
    min: number;
    max: number;
}

export interface DiagnosticLevels {
    [key: string]: LevelRange;
}

export class FormService {
    private readonly iaLevels: DiagnosticLevels = {
        'Tradicional': { min: 10, max: 17 },
        'Exploradora': { min: 18, max: 26 },
        'Inovadora': { min: 27, max: 33 },
        'Visionária': { min: 34, max: 40 }
    };

    private readonly culturaLevels: DiagnosticLevels = {
        'Alta Resistência': { min: 10, max: 17 },
        'Moderadamente Aberta': { min: 18, max: 26 },
        'Favorável': { min: 27, max: 33 },
        'Altamente Alinhada': { min: 34, max: 40 }
    };

    private readonly diagnosticMapping: { [key: string]: string } = {
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

    private readonly companyMeaning: { [key: string]: string[] } = {
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

    async processFormData(formData: FormData) {
        try {
            // Calcula scores de IA e Cultura
            const iaScore = this.calculateIAScore(formData);
            const culturaScore = this.calculateCulturaScore(formData);
            
            // Obtém níveis e insights detalhados
            const iaLevel = this.getLevel(iaScore, 'ia');
            const culturaLevel = this.getLevel(culturaScore, 'cultura');
            const diagnosticKey = `${iaLevel}/${culturaLevel}`;
            
            // Processa os dados do formulário
            const processedData = await this.analyzeFormData(formData, iaScore, culturaScore, iaLevel, culturaLevel);
            
            // Gera variações baseadas nos dados processados
            const variations = await this.generateVariations(formData, iaScore, culturaScore);
            
            return {
                processedData,
                variations,
                scores: {
                    ia: iaScore,
                    cultura: culturaScore
                },
                levels: {
                    ia: iaLevel,
                    cultura: culturaLevel
                },
                diagnostic: {
                    text: this.diagnosticMapping[diagnosticKey] || 'Diagnóstico não encontrado',
                    meaning: this.companyMeaning[diagnosticKey] || [
                        'Não foi possível determinar um significado específico para esta combinação de níveis.',
                        'Por favor, revise os dados inseridos ou entre em contato com o suporte.',
                        'Recomendamos uma nova avaliação para obter insights mais precisos.'
                    ]
                }
            };
        } catch (error) {
            console.error('Erro no processamento dos dados:', error);
            throw error;
        }
    }

    public calculateIAScore(formData: FormData): number {
        const iaQuestions = [
            formData.pergunta_1,
            formData.pergunta_2,
            formData.pergunta_3,
            formData.pergunta_4,
            formData.pergunta_5,
            formData.pergunta_6,
            formData.pergunta_7,
            formData.pergunta_8,
            formData.pergunta_9,
            formData.pergunta_10
        ];
        return this.calculateTotalScore(iaQuestions);
    }

    public calculateCulturaScore(formData: FormData): number {
        const culturaQuestions = [
            formData.pergunta_11,
            formData.pergunta_12,
            formData.pergunta_13,
            formData.pergunta_14,
            formData.pergunta_15,
            formData.pergunta_16,
            formData.pergunta_17,
            formData.pergunta_18,
            formData.pergunta_19,
            formData.pergunta_20
        ];
        return this.calculateTotalScore(culturaQuestions);
    }

    private calculateTotalScore(scores: number[]): number {
        return scores.reduce((acc, score) => acc + score, 0);
    }

    private getLevel(score: number, type: 'ia' | 'cultura'): string {
        const levels = type === 'ia' ? this.iaLevels : this.culturaLevels;
        
        for (const [level, range] of Object.entries(levels)) {
            if (score >= range.min && score <= range.max) {
                return level;
            }
        }
        
        return 'Não Classificado';
    }

    private async analyzeFormData(
        formData: FormData, 
        iaScore: number, 
        culturaScore: number,
        iaLevel: string,
        culturaLevel: string
    ) {
        return {
            iaScore,
            culturaScore,
            companyName: formData.empresa,
            timestamp: new Date().toISOString(),
            iaDetails: this.analyzeIASection(formData, iaLevel),
            culturaDetails: this.analyzeCulturaSection(formData, culturaLevel)
        };
    }

    private analyzeIASection(formData: FormData, level: string) {
        return {
            level,
            strengths: this.identifyStrengths(formData, 'ia', level),
            weaknesses: this.identifyWeaknesses(formData, 'ia', level),
            recommendations: this.generateRecommendations(formData, 'ia', level)
        };
    }

    private analyzeCulturaSection(formData: FormData, level: string) {
        return {
            level,
            strengths: this.identifyStrengths(formData, 'cultura', level),
            weaknesses: this.identifyWeaknesses(formData, 'cultura', level),
            recommendations: this.generateRecommendations(formData, 'cultura', level)
        };
    }

    private identifyStrengths(formData: FormData, section: 'ia' | 'cultura', level: string): string[] {
        const strengths: { [key: string]: { [key: string]: string[] } } = {
            'ia': {
                'Tradicional': [
                    'Processos tradicionais que garantem estabilidade.',
                    'Estrutura organizacional que mantém consistência.',
                    'Conservação dos métodos já testados.'
                ],
                'Exploradora': [
                    'Iniciativas inovadoras em andamento.',
                    'Disposição para experimentar novas tecnologias.',
                    'Projetos piloto bem estruturados.'
                ],
                'Inovadora': [
                    'Uso estruturado de IA em processos-chave.',
                    'Resultados mensuráveis e consistentes.',
                    'Integração tecnológica avançada.'
                ],
                'Visionária': [
                    'Estratégia de IA alinhada com objetivos de negócio.',
                    'Investimentos significativos em tecnologia.',
                    'Visão de longo prazo para inovação.'
                ]
            },
            'cultura': {
                'Alta Resistência': [
                    'Processos bem estabelecidos.',
                    'Estrutura organizacional clara.',
                    'Conhecimento profundo do negócio.'
                ],
                'Moderadamente Aberta': [
                    'Disposição para mudanças graduais.',
                    'Comunicação interna estabelecida.',
                    'Equipes com potencial de adaptação.'
                ],
                'Favorável': [
                    'Cultura que valoriza a inovação.',
                    'Colaboração entre áreas.',
                    'Abertura a novas ideias.'
                ],
                'Altamente Alinhada': [
                    'Cultura de inovação consolidada.',
                    'Liderança engajada com transformação.',
                    'Processos adaptáveis e flexíveis.'
                ]
            }
        };
        
        return strengths[section][level] || ['Não foi possível identificar pontos fortes específicos.'];
    }

    private identifyWeaknesses(formData: FormData, section: 'ia' | 'cultura', level: string): string[] {
        const weaknesses: { [key: string]: { [key: string]: string[] } } = {
            'ia': {
                'Tradicional': [
                    'Uso limitado de tecnologias inovadoras.',
                    'Processos podem estar desatualizados.',
                    'Possível resistência a mudanças.'
                ],
                'Exploradora': [
                    'Falta de integração entre projetos.',
                    'Resultados ainda não consolidados.',
                    'Necessidade de maior estruturação.'
                ],
                'Inovadora': [
                    'Possível complexidade excessiva.',
                    'Desafios de escalabilidade.',
                    'Necessidade de otimização contínua.'
                ],
                'Visionária': [
                    'Alto investimento requerido.',
                    'Complexidade na gestão de mudanças.',
                    'Necessidade de constante atualização.'
                ]
            },
            'cultura': {
                'Alta Resistência': [
                    'Resistência a mudanças.',
                    'Comunicação limitada sobre inovação.',
                    'Processos muito rígidos.'
                ],
                'Moderadamente Aberta': [
                    'Mudanças ainda graduais.',
                    'Necessidade de maior engajamento.',
                    'Processos em transição.'
                ],
                'Favorável': [
                    'Possível falta de estruturação.',
                    'Necessidade de maior integração.',
                    'Desafios de escalabilidade cultural.'
                ],
                'Altamente Alinhada': [
                    'Possível complexidade excessiva.',
                    'Necessidade de manutenção contínua.',
                    'Desafios de gestão de expectativas.'
                ]
            }
        };
        
        return weaknesses[section][level] || ['Não foi possível identificar pontos fracos específicos.'];
    }

    private generateRecommendations(formData: FormData, section: 'ia' | 'cultura', level: string): string[] {
        const recommendations: { [key: string]: { [key: string]: string[] } } = {
            'ia': {
                'Tradicional': [
                    'Iniciar capacitações em tecnologias emergentes.',
                    'Desenvolver projetos piloto de baixo risco.',
                    'Criar um roadmap gradual de transformação digital.'
                ],
                'Exploradora': [
                    'Estruturar os projetos existentes.',
                    'Desenvolver métricas de sucesso.',
                    'Criar processos de governança.'
                ],
                'Inovadora': [
                    'Otimizar processos existentes.',
                    'Expandir para novas áreas.',
                    'Desenvolver capacidades avançadas.'
                ],
                'Visionária': [
                    'Manter liderança tecnológica.',
                    'Explorar novas fronteiras.',
                    'Desenvolver parcerias estratégicas.'
                ]
            },
            'cultura': {
                'Alta Resistência': [
                    'Implementar programas de sensibilização.',
                    'Desenvolver lideranças para mudança.',
                    'Criar canais de comunicação eficientes.'
                ],
                'Moderadamente Aberta': [
                    'Ampliar programas de capacitação.',
                    'Fortalecer a comunicação interna.',
                    'Desenvolver indicadores de mudança.'
                ],
                'Favorável': [
                    'Estruturar processos de inovação.',
                    'Fortalecer a integração entre áreas.',
                    'Desenvolver programas de reconhecimento.'
                ],
                'Altamente Alinhada': [
                    'Manter a cultura de inovação.',
                    'Desenvolver novas práticas.',
                    'Criar programas de sustentabilidade.'
                ]
            }
        };
        
        return recommendations[section][level] || ['Não foi possível gerar recomendações específicas.'];
    }

    async generateVariations(formData: FormData, iaScore: number, culturaScore: number): Promise<Variation[]> {
        const iaLevel = this.getLevel(iaScore, 'ia');
        const culturaLevel = this.getLevel(culturaScore, 'cultura');
        const diagnosticKey = `${iaLevel}/${culturaLevel}`;

        return [
            {
                text: this.diagnosticMapping[diagnosticKey] || 'Diagnóstico não disponível',
                score: iaScore,
                category: 'ia'
            },
            {
                text: this.companyMeaning[diagnosticKey]?.[0] || 'Análise não disponível',
                score: culturaScore,
                category: 'cultura'
            }
        ];
    }
} 