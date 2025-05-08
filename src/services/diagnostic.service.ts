/**
 * Classe responsável pela análise e geração de diagnósticos
 * Baseada na classe DiagnosticAnalyzer do plugin WordPress
 */
export class DiagnosticService {
  private iaLevels: Record<string, [number, number]> = {
    'Tradicional': [10, 17],
    'Exploradora': [18, 26],
    'Inovadora': [27, 33],
    'Visionária': [34, 40]
  };

  private culturaLevels: Record<string, [number, number]> = {
    'Alta Resistência': [10, 17],
    'Moderadamente Aberta': [18, 26],
    'Favorável': [27, 33],
    'Altamente Alinhada': [34, 40]
  };

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
   * Obtém o significado para a empresa com base nas pontuações
   * @param iaScore Pontuação de IA
   * @param culturaScore Pontuação de cultura
   * @returns Array de mensagens significativas para a empresa
   */
  public getCompanyMeaning(iaScore: number, culturaScore: number): string[] {
    const iaLevel = this.getLevel(iaScore, 'ia');
    const culturaLevel = this.getLevel(culturaScore, 'cultura');
    const key = `${iaLevel}/${culturaLevel}`;

    if (this.companyMeaning[key]) {
      return this.companyMeaning[key];
    }

    return [
      'Não foi possível determinar um significado específico para esta combinação de níveis.',
      'Por favor, revise os dados inseridos ou entre em contato com o suporte.',
      'Recomendamos uma nova avaliação para obter insights mais precisos.'
    ];
  }

  /**
   * Obtém o nível com base na pontuação
   * @param score Pontuação (IA ou cultura)
   * @param type Tipo ('ia' ou 'cultura')
   * @returns Nome do nível correspondente
   */
  public getLevel(score: number, type: 'ia' | 'cultura'): string {
    const levels = type === 'ia' ? this.iaLevels : this.culturaLevels;
    
    for (const [level, range] of Object.entries(levels)) {
      if (score >= range[0] && score <= range[1]) {
        return level;
      }
    }
    
    return 'Não Classificado';
  }
  
  /**
   * Obtém o texto do nível de IA com base na pontuação
   */
  public getIALevelText(iaScore: number): string {
    return this.getLevel(iaScore, 'ia');
  }
  
  /**
   * Obtém o texto do nível de cultura com base na pontuação
   */
  public getCulturaLevelText(culturaScore: number): string {
    return this.getLevel(culturaScore, 'cultura');
  }

  /**
   * Analisa as pontuações e retorna o texto diagnóstico
   */
  public analyze(iaScore: number, culturaScore: number): string {
    const iaLevel = this.getLevel(iaScore, 'ia');
    const culturaLevel = this.getLevel(culturaScore, 'cultura');
    
    const key = `${iaLevel}/${culturaLevel}`;
    return this.diagnosticMapping[key] || 'Diagnóstico não encontrado';
  }

  /**
   * Obtém insights detalhados com base nas pontuações
   */
  public getDetailedInsights(iaScore: number, culturaScore: number): {
    ia_level: string;
    cultura_level: string;
    diagnostic_text: string;
    ia_score: number;
    cultura_score: number;
  } {
    const iaLevel = this.getLevel(iaScore, 'ia');
    const culturaLevel = this.getLevel(culturaScore, 'cultura');
    
    return {
      ia_level: iaLevel,
      cultura_level: culturaLevel,
      diagnostic_text: this.analyze(iaScore, culturaScore),
      ia_score: iaScore,
      cultura_score: culturaScore
    };
  }

  /**
   * Obtém recomendações detalhadas com base nas pontuações
   * @param iaScore Pontuação de IA
   * @param culturaScore Pontuação de cultura
   * @returns Objeto com pontos fortes, áreas de melhoria e recomendações
   */
  public getRecommendationText(iaScore: number, culturaScore: number): {
    pontos_fortes: string[];
    areas_melhoria: string[];
    recomendacoes: string[];
  } {
    const recommendations: {
      pontos_fortes: string[];
      areas_melhoria: string[];
      recomendacoes: string[];
    } = {
      pontos_fortes: [],
      areas_melhoria: [],
      recomendacoes: []
    };

    // Determinar a combinação de níveis
    const iaLevel = this.getLevel(iaScore, 'ia');
    const culturaLevel = this.getLevel(culturaScore, 'cultura');
    const key = `${iaLevel}/${culturaLevel}`;

    // Definir recomendações para casos específicos baseados no original
    // Tradicional + Alta Resistência
    if (iaLevel === 'Tradicional' && culturaLevel === 'Alta Resistência') {
      recommendations.pontos_fortes = [
        'Processos tradicionais que garantem estabilidade.',
        'Estrutura organizacional que mantém consistência.',
        'Conservação dos métodos já testados, que podem ser úteis como base para mudanças graduais.'
      ];
      
      recommendations.areas_melhoria = [
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
    // Visionária + Altamente Alinhada
    else if (iaLevel === 'Visionária' && culturaLevel === 'Altamente Alinhada') {
      recommendations.pontos_fortes = [
        'Maturidade avançada em IA com aplicações em toda a organização.',
        'Cultura plenamente alinhada com a inovação e transformação digital.',
        'Governança e estratégia claras que impulsionam o negócio.'
      ];
      
      recommendations.areas_melhoria = [
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
    // Inovadora + Favorável
    else if (iaLevel === 'Inovadora' && culturaLevel === 'Favorável') {
      recommendations.pontos_fortes = [
        'Uso estruturado de IA com resultados consistentes.',
        'Cultura que valoriza e apoia a inovação.',
        'Equilíbrio entre tecnologia e pessoas.'
      ];
      
      recommendations.areas_melhoria = [
        'Aprimorar a escalabilidade dos projetos.',
        'Garantir a continuidade dos investimentos.',
        'Fortalecer a integração entre diferentes áreas.'
      ];
      
      recommendations.recomendacoes = [
        'Consolidar processos: Estabeleça governança clara para garantir a escalabilidade dos projetos.',
        'Fomentar inovação contínua: Crie programas de incentivo à inovação em todos os níveis.',
        'Implementar reconhecimento: Valorize e recompense iniciativas inovadoras para manter o engajamento.'
      ];
    }
    // Para outros casos, fornecer recomendações gerais baseadas nos níveis
    else {
      // Recomendações genéricas baseadas no nível de IA
      if (iaLevel === 'Tradicional') {
        recommendations.recomendacoes.push('Inicie a jornada de IA com projetos piloto de baixa complexidade e alto impacto.');
        recommendations.recomendacoes.push('Invista em capacitação básica para criar uma base de conhecimento.');
      } else if (iaLevel === 'Exploradora') {
        recommendations.recomendacoes.push('Estruture e formalize os projetos de IA já iniciados.');
        recommendations.recomendacoes.push('Desenvolva indicadores para medir o impacto das iniciativas.');
      } else if (iaLevel === 'Inovadora') {
        recommendations.recomendacoes.push('Expanda o uso de IA para mais áreas do negócio.');
        recommendations.recomendacoes.push('Estabeleça processos de governança para garantir escalabilidade.');
      } else if (iaLevel === 'Visionária') {
        recommendations.recomendacoes.push('Continue investindo em inovação e expansão das tecnologias de IA já implementadas.');
        recommendations.recomendacoes.push('Explore novas fronteiras como IA generativa e aprendizado contínuo.');
      }
      
      // Recomendações genéricas baseadas no nível de cultura
      if (culturaLevel === 'Alta Resistência') {
        recommendations.recomendacoes.push('Implemente programas de sensibilização e engajamento para reduzir a resistência cultural.');
        recommendations.recomendacoes.push('Demonstre casos de sucesso para construir confiança.');
      } else if (culturaLevel === 'Moderadamente Aberta') {
        recommendations.recomendacoes.push('Fortaleça a comunicação sobre benefícios e resultados dos projetos de IA.');
        recommendations.recomendacoes.push('Promova workshops e treinamentos para aumentar a aceitação.');
      } else if (culturaLevel === 'Favorável') {
        recommendations.recomendacoes.push('Capitalize a cultura favorável para acelerar a adoção de novas tecnologias.');
        recommendations.recomendacoes.push('Estabeleça programas de incentivo à inovação.');
      } else if (culturaLevel === 'Altamente Alinhada') {
        recommendations.recomendacoes.push('Aproveite a cultura favorável para acelerar a adoção de novas tecnologias.');
        recommendations.recomendacoes.push('Torne-se referência e compartilhe conhecimento com o mercado.');
      }
    }
    
    return recommendations;
  }
} 