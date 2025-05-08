/**
 * Arquivo de dados de recomendações para cada combinação de níveis de IA e cultura
 * Contém 16 conjuntos de recomendações organizados por combinação
 */

export interface Recommendations {
  pontosFortes: string[];
  areasMelhoria: string[];
  recomendacoes: string[];
}

type RecommendationsMap = Record<string, Recommendations>;

/**
 * Mapeamento completo de recomendações para todas as 16 combinações possíveis
 * de níveis de IA e cultura.
 * 
 * Cada combinação contém:
 * - 3 pontos fortes
 * - 3 áreas de melhoria
 * - 5 recomendações específicas
 */
export const recommendationsData: RecommendationsMap = {
  // 1. Tradicional / Alta Resistência
  'Tradicional/Alta Resistência': {
    pontosFortes: [
      'Processos tradicionais que garantem estabilidade.',
      'Estrutura organizacional que mantém consistência.',
      'Conservação dos métodos já testados, que podem ser úteis como base para mudanças graduais.'
    ],
    areasMelhoria: [
      'Necessidade urgente de abrir espaço para novas tecnologias.',
      'Forte resistência cultural que dificulta a adoção de mudanças.',
      'Baixo investimento em inovação e atualização tecnológica.'
    ],
    recomendacoes: [
      'Capacitação e Sensibilização: Inicie programas de treinamento e workshops para demonstrar os benefícios da IA e da inovação.',
      'Projetos Piloto: Comece com iniciativas de baixo risco para gerar resultados e construir confiança.',
      'Comunicação Interna: Estabeleça canais que promovam a troca de ideias e uma cultura de experimentação.',
      'Avaliação de Ferramentas Externas: Explore parcerias com consultorias especializadas ou utilize ferramentas de automação para introduzir a IA gradualmente.',
      'Planejamento de Curto Prazo: Defina metas imediatas para implementar mudanças pontuais e medir resultados, criando casos de sucesso internos.'
    ]
  },

  // 2. Tradicional / Moderadamente Aberta
  'Tradicional/Moderadamente Aberta': {
    pontosFortes: [
      'Alguma abertura para mudanças e experimentação.',
      'Interesse em inovação, mesmo que ainda incipiente.',
      'Capacidade de adaptação em momentos pontuais, demonstrando potencial de evolução.'
    ],
    areasMelhoria: [
      'Baixa adoção estruturada de tecnologias de IA.',
      'Processos tradicionais que limitam a escalabilidade.',
      'Falta de alinhamento claro entre a estratégia tecnológica e os objetivos de inovação.'
    ],
    recomendacoes: [
      'Estratégia Gradual: Desenvolva um roadmap que aproveite a abertura cultural para a introdução de IA.',
      'Incentivo à Experimentação: Promova pilotos em áreas estratégicas com acompanhamento de métricas de desempenho.',
      'Fortalecimento da Governança: Estruture processos que integrem a inovação à rotina operacional.',
      'Mapeamento de Competências: Identifique e desenvolva as habilidades necessárias para acelerar a adoção da IA.',
      'Parcerias Externas: Considere alianças com startups e instituições de ensino para trazer novas perspectivas e conhecimento.'
    ]
  },

  // 3. Tradicional / Favorável
  'Tradicional/Favorável': {
    pontosFortes: [
      'Cultura interna que já valoriza a inovação e o aprendizado.',
      'Colaboradores abertos a novas ideias.',
      'Existência de um ambiente que incentiva o diálogo e a troca de experiências.'
    ],
    areasMelhoria: [
      'Falta de processos estruturados para adoção de IA.',
      'Potencial cultural não totalmente explorado na prática tecnológica.',
      'Ausência de investimentos consistentes em infraestrutura tecnológica.'
    ],
    recomendacoes: [
      'Integração Estratégica: Use a cultura favorável para implementar projetos de IA em áreas-piloto.',
      'Formalização dos Processos: Estruture métodos claros para a adoção de novas tecnologias.',
      'Feedback e Ajustes: Utilize o engajamento dos colaboradores para refinar as iniciativas.',
      'Desenvolvimento de Roadmap Tecnológico: Elabore planos de curto e longo prazo para a incorporação gradual da IA.',
      'Benchmarking Setorial: Compare práticas com empresas do mesmo setor para identificar oportunidades de melhoria.'
    ]
  },

  // 4. Tradicional / Altamente Alinhada
  'Tradicional/Altamente Alinhada': {
    pontosFortes: [
      'Cultura extremamente receptiva e aberta à inovação.',
      'Forte engajamento dos colaboradores e liderança motivada.',
      'Alta capacidade de adaptação quando os projetos são bem direcionados.'
    ],
    areasMelhoria: [
      'Adoção de IA ainda limitada, apesar do ambiente favorável.',
      'Necessidade de alinhar a predisposição cultural com investimentos tecnológicos.',
      'Falta de processos formais para a transição de projetos experimentais para estruturados.'
    ],
    recomendacoes: [
      'Aceleração da Inovação: Aproveite a cultura alinhada para lançar iniciativas de IA estruturadas e de alto impacto.',
      'Investimento Estratégico: Realize investimentos robustos em infraestrutura e capacitação.',
      'Monitoramento de Resultados: Estabeleça indicadores para acompanhar o desempenho e ajustar a estratégia.',
      'Alinhamento de Metas: Estabeleça objetivos integrados que sincronizem a tecnologia com as iniciativas culturais.',
      'Revisão Periódica: Realize revisões constantes do progresso e ajuste as ações conforme o feedback interno.'
    ]
  },

  // 5. Exploradora / Alta Resistência
  'Exploradora/Alta Resistência': {
    pontosFortes: [
      'Iniciativas iniciais de IA já foram testadas, demonstrando potencial.',
      'Interesse em adotar novas tecnologias.',
      'Capacidade de identificar oportunidades, mesmo que em estágio embrionário.'
    ],
    areasMelhoria: [
      'Forte resistência cultural que pode limitar a evolução dos projetos.',
      'Necessidade de promover uma mudança de mentalidade.',
      'Lacuna na comunicação interna sobre os benefícios da inovação.'
    ],
    recomendacoes: [
      'Campanhas de Sensibilização: Realize sessões informativas para reduzir barreiras culturais.',
      'Pilotos Estratégicos: Escolha projetos com resultados rápidos para demonstrar o valor da inovação.',
      'Apoio da Liderança: Envolva líderes para atuarem como agentes de mudança.',
      'Análise de Obstáculos Internos: Realize auditorias para identificar pontos críticos de resistência e elabore planos de ação.',
      'Programa de Mentoria: Implemente mentorias para ajudar líderes e equipes a adotarem uma mentalidade inovadora.'
    ]
  },

  // 6. Exploradora / Moderadamente Aberta
  'Exploradora/Moderadamente Aberta': {
    pontosFortes: [
      'Início da adoção de IA com interesse em inovar.',
      'Abertura cultural que pode ser explorada para ampliar iniciativas.',
      'Existência de iniciativas já em andamento que demonstram potencial para expansão.'
    ],
    areasMelhoria: [
      'Falta de escalabilidade e formalização dos processos de inovação.',
      'Necessidade de integração maior entre IA e cultura interna.',
      'Carência de indicadores claros para medir o sucesso dos projetos.'
    ],
    recomendacoes: [
      'Planejamento Estratégico: Desenvolva um roadmap que una os projetos de IA com os objetivos culturais.',
      'Capacitação Contínua: Invista em treinamentos regulares e na disseminação de boas práticas.',
      'Integração de Processos: Crie mecanismos de governança para assegurar a expansão sustentável dos projetos.',
      'Estabelecimento de KPIs: Defina indicadores-chave para monitorar a eficácia das iniciativas.',
      'Iniciativas de Engajamento: Crie fóruns interdepartamentais para estimular a troca de experiências.'
    ]
  },

  // 7. Exploradora / Favorável
  'Exploradora/Favorável': {
    pontosFortes: [
      'Iniciativas de IA em andamento com resultados promissores.',
      'Cultura que valoriza a inovação e a colaboração.',
      'Forte predisposição dos colaboradores para experimentar novas abordagens.'
    ],
    areasMelhoria: [
      'Necessidade de formalizar os processos para transformar iniciativas exploratórias em projetos estruturados.',
      'Potencial de escalabilidade ainda não totalmente aproveitado.',
      'Falta de integração completa entre as áreas que utilizam IA e as demais operações da empresa.'
    ],
    recomendacoes: [
      'Formalização de Projetos: Estruture processos e critérios claros para a expansão dos pilotos de IA.',
      'Integração Sistêmica: Promova a conexão entre diferentes áreas para otimizar o uso da tecnologia.',
      'Fortalecimento da Comunicação: Utilize cases de sucesso para motivar e atrair novos investimentos.',
      'Capacitação Avançada: Invista em treinamentos especializados para elevar o nível de expertise interno.',
      'Adoção de Ferramentas Analíticas: Implemente plataformas para medir o impacto das iniciativas e orientar a tomada de decisão.'
    ]
  },

  // 8. Exploradora / Altamente Alinhada
  'Exploradora/Altamente Alinhada': {
    pontosFortes: [
      'Forte predisposição cultural para a inovação que pode acelerar a adoção de IA.',
      'Iniciativas exploratórias demonstram potencial de crescimento.',
      'Alto engajamento da liderança, facilitando a implementação de novas ideias.'
    ],
    areasMelhoria: [
      'Falta de uma estratégia consolidada que una o potencial tecnológico com a cultura.',
      'Necessidade de intensificar investimentos para avançar da fase exploratória para a estruturação completa.',
      'Ausência de processos padronizados para avaliação e replicação dos projetos bem-sucedidos.'
    ],
    recomendacoes: [
      'Roadmap Estratégico: Desenvolva um plano robusto que alavanque a cultura altamente alinhada para escalar a IA.',
      'Investimento em Tecnologia: Direcione recursos para consolidar infraestrutura e treinamento.',
      'Monitoramento e Ajustes: Crie indicadores para avaliar o impacto e ajustar a estratégia continuamente.',
      'Inovação Colaborativa: Crie laboratórios de inovação ou promova hackathons internos para estimular a criatividade.',
      'Governança Adaptativa: Desenvolva um modelo de governança que permita ajustes rápidos conforme a evolução dos projetos.'
    ]
  },

  // 9. Inovadora / Alta Resistência
  'Inovadora/Alta Resistência': {
    pontosFortes: [
      'Adoção de IA com resultados positivos e estrutura emergente.',
      'Projetos de inovação em andamento, mesmo com barreiras culturais.',
      'Capacidade de demonstrar, por meio de indicadores, os benefícios iniciais da IA.'
    ],
    areasMelhoria: [
      'Resistência cultural que pode comprometer a expansão dos projetos inovadores.',
      'Necessidade de alinhar melhor as práticas inovadoras ao ambiente interno.',
      'Falta de mecanismos de comunicação eficazes para demonstrar os ganhos da inovação.'
    ],
    recomendacoes: [
      'Gestão de Mudanças: Implemente ações para reduzir a resistência, como programas de coaching e comunicação interna.',
      'Integração de Projetos: Promova a convergência entre os projetos de IA e iniciativas de transformação cultural.',
      'Incentivos Internos: Crie recompensas e reconhecimentos para estimular a adesão às mudanças.',
      'Reestruturação Organizacional: Considere revisar a estrutura interna para reduzir silos e fomentar a colaboração.',
      'Comunicação Assertiva: Desenvolva campanhas internas que destaquem os benefícios dos projetos de IA para reduzir a resistência.'
    ]
  },

  // 10. Inovadora / Moderadamente Aberta
  'Inovadora/Moderadamente Aberta': {
    pontosFortes: [
      'Uso estruturado de IA com resultados consistentes.',
      'Abertura cultural que permite avanços, embora ainda moderada.',
      'Experiência acumulada em projetos-piloto que já oferecem insights valiosos.'
    ],
    areasMelhoria: [
      'Necessidade de aumentar o engajamento dos colaboradores para potencializar a transformação.',
      'Fortalecimento da governança para tornar a inovação mais abrangente.',
      'Falta de integração plena entre as áreas operacionais e as iniciativas de IA.'
    ],
    recomendacoes: [
      'Ampliação de Capacitação: Intensifique treinamentos e crie fóruns para troca de experiências.',
      'Governança da Inovação: Formalize processos de avaliação e escalabilidade dos projetos.',
      'Feedback Contínuo: Utilize os resultados dos projetos para ajustar estratégias e incentivar o engajamento.',
      'Integração de Stakeholders: Envolva diferentes níveis hierárquicos para assegurar que a estratégia de IA seja bem compreendida.',
      'Estudo de Caso Interno: Documente os projetos bem-sucedidos para servir de referência e inspiração interna.'
    ]
  },

  // 11. Inovadora / Favorável
  'Inovadora/Favorável': {
    pontosFortes: [
      'Uso estruturado de IA com integração em áreas-chave.',
      'Cultura interna que apoia e incentiva a inovação.',
      'Boa comunicação interna que permite a disseminação dos resultados positivos.'
    ],
    areasMelhoria: [
      'Necessidade de maior escalabilidade das iniciativas.',
      'Consolidação da governança para maior eficiência dos processos.',
      'Carência de investimentos contínuos para atualização tecnológica e metodológica.'
    ],
    recomendacoes: [
      'Consolidação de Processos: Estruture a governança da inovação para ampliar e padronizar os projetos.',
      'Inovação Contínua: Incentive a experimentação e a constante atualização tecnológica.',
      'Comunicação de Resultados: Divulgue cases de sucesso para reforçar o engajamento e atrair novos investimentos.',
      'Aprimoramento Tecnológico: Continue investindo em tecnologias emergentes e atualize as ferramentas utilizadas.',
      'Programas de Reconhecimento: Crie incentivos para reconhecer os colaboradores que contribuem significativamente para a inovação.'
    ]
  },

  // 12. Inovadora / Altamente Alinhada
  'Inovadora/Altamente Alinhada': {
    pontosFortes: [
      'Projetos de IA consolidados que geram impacto estratégico.',
      'Cultura robusta que favorece a inovação em todos os níveis.',
      'Alto nível de sinergia entre as áreas, possibilitando uma rápida implementação de melhorias.'
    ],
    areasMelhoria: [
      'Manutenção do ritmo de inovação e exploração de novas tecnologias.',
      'Adequação da governança para acompanhar o crescimento dos projetos.',
      'Risco de complacência devido ao sucesso atual, exigindo constante revisão e atualização.'
    ],
    recomendacoes: [
      'Inovação Preditiva: Invista em P&D para antecipar tendências e explorar tecnologias disruptivas.',
      'Escalabilidade: Estruture processos que garantam a expansão contínua dos projetos.',
      'Benchmarking: Compare os resultados com as melhores práticas do setor e ajuste as estratégias conforme necessário.',
      'Parcerias Estratégicas: Busque colaborações com universidades, centros de pesquisa ou outras empresas inovadoras para manter o fluxo de ideias.',
      'Monitoramento Proativo: Utilize sistemas avançados de análise para prever mudanças de mercado e ajustar as estratégias rapidamente.'
    ]
  },

  // 13. Visionária / Alta Resistência
  'Visionária/Alta Resistência': {
    pontosFortes: [
      'Adoção de IA em nível estratégico, com uma visão de futuro clara.',
      'Investimentos significativos em tecnologia e inovação.',
      'Capacidade de desenvolver estratégias de longo prazo que posicionam a empresa como referência, mesmo em ambientes desafiadores.'
    ],
    areasMelhoria: [
      'Resistência cultural que pode limitar o pleno aproveitamento do potencial da IA.',
      'Necessidade de promover uma mudança interna que acompanhe a visão tecnológica.',
      'Desconexão entre a visão estratégica de IA e a implementação prática, dificultando a absorção da inovação pelos colaboradores.'
    ],
    recomendacoes: [
      'Mudança Cultural Intensiva: Desenvolva programas de mudança cultural focados em comunicação, treinamentos e liderança transformadora.',
      'Integração de Equipes: Incentive a colaboração entre departamentos para reduzir barreiras e aumentar a adesão às novas práticas.',
      'Monitoramento de Impacto: Utilize métricas para medir o engajamento cultural e ajustar as ações de mudança.',
      'Consultoria Externa: Considere contratar especialistas em transformação cultural para apoiar a mudança de mindset.',
      'Programas de Inovação Interna: Crie iniciativas que incentivem a experimentação e a inovação dentro das equipes, mesmo diante da resistência.'
    ]
  },

  // 14. Visionária / Moderadamente Aberta
  'Visionária/Moderadamente Aberta': {
    pontosFortes: [
      'Estratégia de IA avançada, com visão inovadora e investimentos robustos.',
      'Alguns avanços na cultura que permitem a inovação.',
      'Existência de projetos-piloto que já demonstram resultados promissores, evidenciando o potencial de crescimento.'
    ],
    areasMelhoria: [
      'A cultura interna precisa se adaptar mais plenamente à visão tecnológica.',
      'Ampliação da comunicação e engajamento entre as equipes.',
      'Falta de mecanismos sistemáticos para disseminar as boas práticas e aprendizados dos projetos de IA.'
    ],
    recomendacoes: [
      'Alinhamento Estratégico: Refine a comunicação interna para que a estratégia de IA seja completamente absorvida por todos os níveis.',
      'Iniciativas de Engajamento: Crie programas de incentivo e reconhecimento para promover a participação ativa dos colaboradores.',
      'Revisão de Processos: Ajuste os processos de tomada de decisão para incorporar feedback e promover agilidade.',
      'Comunicação Estratégica: Desenvolva uma estratégia que evidencie os sucessos e a visão de futuro da empresa.',
      'Fomento à Colaboração: Estabeleça programas de integração entre áreas para fortalecer o compartilhamento de conhecimento.'
    ]
  },

  // 15. Visionária / Favorável
  'Visionária/Favorável': {
    pontosFortes: [
      'A empresa é referência na adoção estratégica de IA.',
      'Cultura interna altamente colaborativa e aberta à inovação.',
      'Excelente capacidade de adaptação que permite à organização ajustar rapidamente suas estratégias quando necessário.'
    ],
    areasMelhoria: [
      'Explorar ainda mais tecnologias emergentes para manter a vantagem competitiva.',
      'Refinar processos para que a escalabilidade acompanhe a inovação contínua.',
      'Necessidade de maior integração entre áreas operacionais e de inovação para otimizar os resultados.'
    ],
    recomendacoes: [
      'Expansão Tecnológica: Invista em novas tecnologias e parcerias estratégicas para se manter à frente.',
      'Otimização de Processos: Fortaleça a governança e a integração entre áreas para ampliar os resultados.',
      'Inovação Contínua: Promova um ambiente de experimentação e aprendizado constante para manter a posição de liderança.',
      'Desenvolvimento de Parcerias: Busque alianças estratégicas com outras organizações para co-criar soluções inovadoras.',
      'Capacitação em Novas Tendências: Promova treinamentos e workshops focados em tendências emergentes para manter a competitividade.'
    ]
  },

  // 16. Visionária / Altamente Alinhada
  'Visionária/Altamente Alinhada': {
    pontosFortes: [
      'Máxima integração entre tecnologia e cultura, posicionando a empresa como referência em inovação.',
      'Processos robustos e visão estratégica que impulsionam resultados mensuráveis.',
      'Elevada capacidade de adaptação e antecipação de tendências, permitindo à organização manter-se na vanguarda.'
    ],
    areasMelhoria: [
      'Manter a agilidade e a adaptabilidade mesmo com a estrutura consolidada.',
      'Continuar investindo em P&D para antecipar e liderar tendências.',
      'Risco de sobrecarga operacional devido à alta complexidade dos processos, exigindo ajustes contínuos para manter a eficiência.'
    ],
    recomendacoes: [
      'Liderança Inovadora: Mantenha programas contínuos de pesquisa e desenvolvimento, incentivando a experimentação e a adoção de tecnologias de ponta.',
      'Agilidade Organizacional: Desenvolva processos que garantam rápida adaptação às mudanças do mercado, mantendo a cultura inovadora.',
      'Benchmarking Global: Realize comparações com os líderes do setor para identificar novas oportunidades e manter a posição de vanguarda.',
      'Fomento à Pesquisa Interna: Incentive a criação de grupos de pesquisa e desenvolvimento para explorar novas oportunidades.',
      'Estratégia de Sustentabilidade: Desenvolva iniciativas que garantam a continuidade e evolução dos projetos de IA, alinhadas a uma visão de longo prazo.'
    ]
  }
}; 