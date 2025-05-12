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
    
    // Ajustar o contexto para escala 2x (alta resolução)
    ctx.scale(2, 2);
    
    // Configurar fonte para suportar caracteres especiais
    ctx.font = '12px sans-serif';
    ctx.textBaseline = 'middle';
    
    // Determinar se é gráfico de IA ou Cultura sem depender do título
    const isIAChart = this.isIAChart(labels);
    
    // Cores consistentes para cada tipo de gráfico
    const chartColors = isIAChart ? 
      { backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgb(54, 162, 235)', pointColor: 'rgb(32, 128, 204)' } : 
      { backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgb(255, 99, 132)', pointColor: 'rgb(220, 53, 89)' };
    
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
        pointRadius: 7, 
        pointHoverRadius: 9,
        fill: true
      };
    });
    
    // Verificar se há rótulos não-ASCII e substituir por alternativas simples
    const sanitizedLabels = labels.map(label => {
      // Se temos caracteres não-ASCII
      if (/[^\u0000-\u007f]/.test(label)) {
        // Mapear rótulos comuns para versões ASCII
        if (label.includes('Utilização')) return 'Utilizacao';
        if (label.includes('Abrangência')) return 'Abrangencia';
        if (label.includes('Identificação')) return 'Identificacao';
        if (label.includes('Mensuração')) return 'Mensuracao';
        if (label.includes('Avaliação')) return 'Avaliacao';
        if (label.includes('Integração')) return 'Integracao';
        if (label.includes('Capacitação')) return 'Capacitacao';
        if (label.includes('Mudanças')) return 'Mudancas';
        if (label.includes('Comunicação')) return 'Comunicacao';
        if (label.includes('Colaboração')) return 'Colaboracao';
        if (label.includes('Experimentação')) return 'Experimentacao';
        if (label.includes('Inovação')) return 'Inovacao';
        
        // Remover acentos e caracteres especiais como fallback
        return label.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      }
      return label;
    });
    
    // Encurtar os rótulos muito longos
    const shortLabels = sanitizedLabels.map(label => {
      if (label.length > 15) {
        return label.substring(0, 12) + '...';
      }
      return label;
    });
    
    // Configurações melhoradas para exibir rótulos e valores
    const config: ChartConfiguration = {
      type: 'radar' as ChartType,
      data: {
        labels: shortLabels,
        datasets: processedDatasets,
      },
      options: {
        responsive: false,
        maintainAspectRatio: true,
        layout: {
          padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        },
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 18,
              weight: 'bold',
              family: 'sans-serif'
            },
            padding: {
              top: 10,
              bottom: 15
            }
          },
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: {
              size: 14,
              family: 'sans-serif'
            },
            bodyFont: {
              size: 14,
              family: 'sans-serif'
            },
            padding: 10,
            displayColors: true,
            callbacks: {
              title: function(tooltipItems) {
                return sanitizedLabels[tooltipItems[0].dataIndex];
              },
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.r !== null) {
                  label += context.parsed.r;
                }
                return label;
              }
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 4,
            beginAtZero: true,
            angleLines: {
              display: true,
              color: 'rgba(0, 0, 0, 0.3)',
              lineWidth: 1
            },
            grid: {
              circular: true,
              color: 'rgba(0, 0, 0, 0.2)',
              lineWidth: 1.5
            },
            pointLabels: {
              display: true,
              centerPointLabels: false,
              font: {
                size: 12,
                weight: 'bold',
                family: 'sans-serif'
              },
              color: '#000',
              padding: 10,
              callback: function(label) {
                if (label.length > 12) {
                  const words = label.split(' ');
                  let lines = [];
                  let currentLine = '';
                  
                  for (const word of words) {
                    if ((currentLine + word).length <= 12) {
                      currentLine += (currentLine ? ' ' : '') + word;
                    } else {
                      lines.push(currentLine);
                      currentLine = word;
                    }
                  }
                  
                  if (currentLine) {
                    lines.push(currentLine);
                  }
                  
                  return lines;
                }
                return label;
              }
            },
            ticks: {
              display: true,
              count: 5,
              stepSize: 1,
              color: '#000000',
              showLabelBackdrop: true,
              backdropPadding: 2,
              backdropColor: 'rgba(255, 255, 255, 0.75)',
              font: {
                size: 14,
                weight: 'bold',
                family: 'sans-serif'
              },
              z: 1,
              callback: function(value) {
                return value.toString();
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0,
            borderWidth: 3,
            borderCapStyle: 'round'
          },
          point: {
            radius: 7,
            hoverRadius: 9,
            borderWidth: 2,
            hitRadius: 10
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
   * Verifica se um gráfico é do tipo IA com base nos seus rótulos
   * @param labels Rótulos do gráfico
   * @returns true se for um gráfico de IA, false caso contrário
   */
  private isIAChart(labels: string[]): boolean {
    // Palavras-chave comuns em gráficos de IA
    const iaKeywords = [
      'IA', 'Uso', 'Abrangência', 'Desafios', 
      'Integração', 'Estratégica', 'Avaliação'
    ];
    
    // Palavras-chave para cultura
    const culturaKeywords = [
      'Mudanças', 'Engajamento', 'Colaboração', 'Experimentação',
      'Liderança', 'Comunicação', 'Feedback'
    ];
    
    // Verificar primeiro rótulo como heurística simples
    if (labels && labels.length > 0) {
      const firstLabel = labels[0].toLowerCase();
      
      // Se o primeiro label for "Uso de IA", é definitivamente IA
      if (firstLabel.includes('uso') || firstLabel.includes('ia')) {
        return true;
      }
      
      // Se o primeiro label for "Mudanças", é definitivamente Cultura
      if (firstLabel.includes('mudança') || firstLabel.includes('engajamento')) {
        return false;
      }
    }
    
    // Contagem de palavras-chave
    let iaCount = 0;
    let culturaCount = 0;
    
    // Verificar todos os rótulos
    for (const label of labels) {
      const lowerLabel = label.toLowerCase();
      
      // Contar palavras-chave de IA
      for (const keyword of iaKeywords) {
        if (lowerLabel.includes(keyword.toLowerCase())) {
          iaCount++;
          break;
        }
      }
      
      // Contar palavras-chave de Cultura
      for (const keyword of culturaKeywords) {
        if (lowerLabel.includes(keyword.toLowerCase())) {
          culturaCount++;
          break;
        }
      }
    }
    
    // Determinar pelo maior número de correspondências
    return iaCount >= culturaCount;
  }
} 