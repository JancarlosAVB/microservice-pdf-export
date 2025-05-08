import { Canvas, CanvasRenderingContext2D } from 'canvas';
import { Chart, ChartConfiguration, ChartType, RadarController, LineElement, PointElement, RadialLinearScale, Tooltip, Legend, Filler } from 'chart.js';
import { RadarChartData } from '../interfaces/chart.interface';

// Registrar os componentes necessários do Chart.js
Chart.register(RadarController, LineElement, PointElement, RadialLinearScale, Tooltip, Legend, Filler);

export class ChartService {
  /**
   * Gera um gráfico radar no canvas fornecido
   * @param canvas Canvas onde o gráfico será desenhado
   * @param options Dados e opções para o gráfico radar
   * @returns O objeto Chart criado
   */
  public generateRadarChart(canvas: Canvas, options: RadarChartData): Chart {
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    const { labels, datasets, width = 800, height = 800, title = '' } = options;
    
    // Garantir dimensões exatas para todos os gráficos
    canvas.width = width * 2; // Alta resolução
    canvas.height = height * 2; // Alta resolução
    
    // Determinar se é gráfico de IA ou Cultura sem depender do título
    const isIAChart = this.isIAChart(labels);
    
    // Cores consistentes para cada tipo de gráfico
    const chartColors = isIAChart ? 
      { backgroundColor: 'rgba(54, 162, 235, 0.3)', borderColor: 'rgb(54, 162, 235)', pointColor: 'rgb(54, 162, 235)' } : 
      { backgroundColor: 'rgba(255, 99, 132, 0.3)', borderColor: 'rgb(255, 99, 132)', pointColor: 'rgb(255, 99, 132)' };
    
    // Processar dados de forma idêntica para ambos os gráficos
    const processedDatasets = datasets.map(dataset => {
      // Garantir que todos os valores estejam entre 1 e 4
      const processedData = dataset.data.map(value => {
        if (value < 1) return 1;
        if (value > 4) return 4;
        return Math.round(value); // Arredondar para valores inteiros
      });
      
      return {
        ...dataset,
        data: processedData,
        backgroundColor: chartColors.backgroundColor,
        borderColor: chartColors.borderColor,
        borderWidth: 3,
        pointBackgroundColor: chartColors.pointColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartColors.borderColor,
        pointRadius: 5,
        pointHoverRadius: 7
      };
    });
    
    // Configurações idênticas para ambos os tipos de gráfico
    const config: ChartConfiguration = {
      type: 'radar' as ChartType,
      data: {
        labels: labels,
        datasets: processedDatasets,
      },
      options: {
        responsive: false, // Desabilitar responsividade para manter tamanho exato
        maintainAspectRatio: true, // Manter proporção
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 14,
              weight: 'bold',
            },
            padding: {
              top: 10,
              bottom: 10
            }
          },
          legend: {
            display: false, // Ocultar legenda para ambos os gráficos
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: {
              size: 12
            },
            bodyFont: {
              size: 12
            },
            padding: 8
          }
        },
        scales: {
          r: {
            min: 0,
            max: 4,
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              backdropColor: 'transparent',
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#333',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.2)',
              lineWidth: 1,
              circular: true
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.2)',
              lineWidth: 1
            },
            pointLabels: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#000000',
              padding: 6,
              // Limitar tamanho dos rótulos para manter proporções idênticas
              callback: function(value: string) {
                return value.length > 12 ? value.substring(0, 12) + '...' : value;
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.1,
            borderWidth: 2
          },
          point: {
            radius: 5,
            hoverRadius: 7,
            borderWidth: 2
          }
        }
      }
    };

    // Criar o gráfico
    return new Chart(ctx as any, config);
  }

  /**
   * Gera uma cor aleatória
   * @param alpha Valor de opacidade (0-1)
   * @returns String de cor em formato rgba
   */
  private generateRandomColor(alpha: number): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Gera cores aleatórias para o gráfico
   * @param count Número de cores a serem geradas
   * @param alpha Valor de opacidade (0-1)
   * @returns Array de strings de cores em formato rgba
   */
  private generateRandomColors(count: number, alpha: number): string[] {
    const colors: string[] = [];
    
    for (let i = 0; i < count; i++) {
      colors.push(this.generateRandomColor(alpha));
    }
    
    return colors;
  }

  /**
   * Determina se o gráfico é de IA ou Cultura com base nos rótulos
   * @param labels Array de rótulos do gráfico
   * @returns true se for gráfico de IA, false se for gráfico de Cultura
   */
  private isIAChart(labels: string[]): boolean {
    // Palavras-chave associadas ao gráfico de IA
    const iaKeywords = [
      'estratégia', 'estrat',
      'processos', 'process',
      'governança', 'governan',
      'dados', 'data',
      'tecnologia', 'tecnolog',
      'infraestrutura', 'infra',
      'automação', 'automa',
      'inteligência', 'ia'
    ];
    
    // Palavras-chave associadas ao gráfico de Cultura
    const culturaKeywords = [
      'cultura', 'cultur',
      'liderança', 'lideran',
      'pessoas', 'colaborador',
      'mudança', 'mudan',
      'engajamento', 'engaja',
      'adoção', 'adoc',
      'resistência', 'resist',
      'comunicação', 'comunica'
    ];
    
    // Contar quantas palavras-chave de cada tipo aparecem nos rótulos
    let iaKeywordCount = 0;
    let culturaKeywordCount = 0;
    
    // Verificar cada rótulo
    for (const label of labels) {
      const lowerLabel = label.toLowerCase();
      
      // Verificar palavras-chave de IA
      for (const keyword of iaKeywords) {
        if (lowerLabel.includes(keyword)) {
          iaKeywordCount++;
          break; // Se encontrou uma keyword de IA neste rótulo, não precisa verificar as outras
        }
      }
      
      // Verificar palavras-chave de Cultura
      for (const keyword of culturaKeywords) {
        if (lowerLabel.includes(keyword)) {
          culturaKeywordCount++;
          break; // Se encontrou uma keyword de Cultura neste rótulo, não precisa verificar as outras
        }
      }
    }
    
    // Determinar o tipo de gráfico com base na contagem de palavras-chave
    // Se houver mais palavras-chave de IA do que de Cultura, é um gráfico de IA
    return iaKeywordCount >= culturaKeywordCount;
  }
} 