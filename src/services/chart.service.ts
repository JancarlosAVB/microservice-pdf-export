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
    
    // Aumentar a resolução do canvas para melhorar a qualidade
    canvas.width = 1200;
    canvas.height = 1200;
    
    // Define cores fixas para cada tipo de gráfico com melhor contraste
    const isIAChart = title.toLowerCase().includes('inteligência') || 
                      title.toLowerCase().includes('ia') || 
                      labels.some(label => label.toLowerCase().includes('ia'));
    
    // Cores para cada tipo de gráfico com melhor opacidade para visualização
    const chartColors = isIAChart ? 
      { backgroundColor: 'rgba(54, 162, 235, 0.3)', borderColor: 'rgb(54, 162, 235)', pointColor: 'rgb(54, 162, 235)' } : 
      { backgroundColor: 'rgba(255, 99, 132, 0.3)', borderColor: 'rgb(255, 99, 132)', pointColor: 'rgb(255, 99, 132)' };
    
    // Processar dados para garantir que estejam na escala correta (1-4)
    const processedDatasets = datasets.map(dataset => {
      // Garantir que todos os valores estejam entre 1 e 4
      const processedData = dataset.data.map(value => {
        if (value < 1) return 1;
        if (value > 4) return 4;
        return Math.round(value); // Arredondar para ter valores inteiros
      });
      
      return {
        ...dataset,
        data: processedData,
        backgroundColor: chartColors.backgroundColor,
        borderColor: chartColors.borderColor,
        borderWidth: 3, // Aumentar espessura da linha
        pointBackgroundColor: chartColors.pointColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: chartColors.borderColor,
        pointRadius: 6, // Pontos maiores
        pointHoverRadius: 8
      };
    });
    
    // Configurar o gráfico com opções de alta qualidade
    const config: ChartConfiguration = {
      type: 'radar' as ChartType,
      data: {
        labels: labels,
        datasets: processedDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16, // Aumentar tamanho do título
              weight: 'bold',
            },
            padding: {
              top: 20,
              bottom: 20
            }
          },
          legend: {
            display: false, // Ocultar a legenda para simplificar
            position: 'top' as const,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 14
            },
            padding: 10
          }
        },
        scales: {
          r: {
            min: 0,
            max: 4, // Escala de 1-4
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              backdropColor: 'transparent',
              font: {
                size: 30, // Fonte maior para os números das escalas
                weight: 'bold'
              },
              color: '#333',
              padding: 5
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.2)', // Linhas de grade mais visíveis
              lineWidth: 2, // Linhas mais grossas
              circular: true
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.2)', // Linhas de ângulo mais visíveis
              lineWidth: 2 // Linhas mais grossas
            },
            pointLabels: {
              font: {
                size: 30, // Fonte maior para os textos dos eixos
                weight: 'bold'
              },
              color: '#000000', // Cor mais escura para melhor legibilidade
              padding: 15, // Mais espaço entre labels
              // Quebrar linhas longas para melhor formatação
              callback: function(value: string) {
                if (value.length > 20) {
                  const words = value.split(' ');
                  let result = '';
                  let line = '';
                  
                  for (const word of words) {
                    if ((line + word).length > 15) {
                      result += line + '\n'; // Usando a sequência de escape correta
                      line = word + ' ';
                    } else {
                      line += word + ' ';
                    }
                  }
                  
                  return result + line.trim();
                }
                return value;
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.2, // Adicionar suavidade às linhas
            borderWidth: 3 // Linhas mais grossas
          },
          point: {
            radius: 6, // Pontos maiores
            hoverRadius: 8,
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
} 