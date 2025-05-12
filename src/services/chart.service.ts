import { Canvas, CanvasRenderingContext2D } from 'canvas';
import { Chart, ChartConfiguration, ChartType, RadarController, LineElement, PointElement, RadialLinearScale, Tooltip, Legend, Filler } from 'chart.js';
import { RadarChartData } from '../interfaces/chart.interface';
import path from 'path';
import fs from 'fs';

// Registrar os componentes necessários do Chart.js
Chart.register(RadarController, LineElement, PointElement, RadialLinearScale, Tooltip, Legend, Filler);

export class ChartService {
  constructor() {
    // Garantir que a fonte monospace seja usada mesmo se houver problemas com fontes no sistema
    Chart.defaults.font.family = 'monospace';
  }

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
    
    // Determinar se é gráfico de IA ou Cultura sem depender do título
    const isIAChart = this.isIAChart(labels);
    
    // Cores consistentes para cada tipo de gráfico
    const chartColors = isIAChart ? 
      { backgroundColor: 'rgba(54, 162, 235, 0.4)', borderColor: 'rgb(54, 162, 235)', pointColor: 'rgb(32, 128, 204)' } : 
      { backgroundColor: 'rgba(255, 99, 132, 0.4)', borderColor: 'rgb(255, 99, 132)', pointColor: 'rgb(220, 53, 89)' };
    
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
        pointRadius: 8, 
        pointHoverRadius: 10,
        fill: true
      };
    });
    
    // Obter nomes curtos para categorias (sem acentos, ASCII apenas)
    const shortLabels = this.getShortLabels(isIAChart, labels.length);
    
    // Configurações do gráfico com abordagem simplificada
    const config: ChartConfiguration = {
      type: 'radar' as ChartType,
      data: {
        labels: shortLabels, // Usar nomes curtos ASCII em vez de números
        datasets: processedDatasets,
      },
      options: {
        responsive: false,
        maintainAspectRatio: true,
        layout: {
          padding: {
            top: 30,
            right: 30,
            bottom: 30,
            left: 30
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: {
              size: 14,
              family: 'monospace'
            },
            bodyFont: {
              size: 14,
              family: 'monospace'
            },
            padding: 10,
            displayColors: true,
            callbacks: {
              title: function(tooltipItems) {
                const fullLabels = isIAChart ? 
                  this.getIALegend() : 
                  this.getCulturaLegend();
                return fullLabels[tooltipItems[0].dataIndex];
              }.bind(this),
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
                size: 14,  // Aumentado para melhor legibilidade
                weight: 'bold',
                family: 'monospace'
              },
              color: '#000',
              padding: 15,  // Aumentado para dar mais espaço
              callback: function(value) {
                // Permite quebras de linha com o caractere \n
                return value;
              }
            },
            ticks: {
              display: true,
              count: 5,
              stepSize: 1,
              color: '#000000',
              showLabelBackdrop: false,
              backdropPadding: 2,
              backdropColor: 'rgba(255, 255, 255, 0.75)',
              font: {
                size: 14,
                weight: 'bold',
                family: 'monospace'
              },
              z: 1
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
    const chart = new Chart(ctx as any, config);
    
    // Mantemos a legenda na parte inferior com as descrições completas
    chart.draw = function() {
      // Chamar a função original de desenho
      Chart.prototype.draw.apply(this, arguments);
      
      // Desenhar legenda manual com a descrição completa para cada item
      const legendY = height - 30;
      const legendX = 50;
      
      ctx.save();
      ctx.font = '14px monospace';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      ctx.fillText('Legenda:', legendX, legendY);
      
      // Determinar quais rótulos completos mostrar (IA ou Cultura)
      const legendTexts = isIAChart ? this.getIALegend() : this.getCulturaLegend();
      const shortLabelTexts = this.getShortLabels(isIAChart, labels.length);
      
      // Posicionar abaixo do gráfico
      for (let i = 0; i < shortLabelTexts.length; i++) {
        const labelText = `${shortLabelTexts[i]}: ${legendTexts[i]}`;
        const colIndex = i % 2;
        const rowIndex = Math.floor(i / 2);
        
        const x = legendX + (colIndex * 200);
        const y = legendY + 25 + (rowIndex * 20);
        
        ctx.fillText(labelText, x, y);
      }
      
      ctx.restore();
    }.bind(this);
    
    return chart;
  }

  // Nomes completos para IA
  private getIALegend(): string[] {
    return [
      "Uso de IA",
      "Abrangencia",
      "Desafios",
      "Beneficios",
      "Avaliacao de tecnologias",
      "Escalabilidade",
      "Integracao com processos",
      "Capacitacao",
      "Investimento",
      "Visao estrategica"
    ];
  }

  // Nomes completos para Cultura
  private getCulturaLegend(): string[] {
    return [
      "Mudancas",
      "Engajamento",
      "Colaboracao",
      "Experimentacao",
      "Lideranca",
      "Comunicacao",
      "Capacitacao",
      "Reconhecimento",
      "Cultura de feedback",
      "Alinhamento estrategico"
    ];
  }

  // Nomes curtos para usar diretamente no gráfico com quebra de linha se necessário
  private getShortLabels(isIAChart: boolean, length: number): string[] {
    const iaLabels = [
      "Uso de IA",
      "Abrangencia",
      "Desafios",
      "Beneficios",
      "Avaliacao de\ntecnologias",
      "Escalabilidade",
      "Integracao com\nprocessos",
      "Capacitacao",
      "Investimento",
      "Visao\nestrategica"
    ];
    
    const culturaLabels = [
      "Mudancas",
      "Engajamento",
      "Colaboracao",
      "Experimentacao",
      "Lideranca",
      "Comunicacao",
      "Capacitacao",
      "Reconhecimento",
      "Cultura de\nfeedback",
      "Alinhamento\nestrategico"
    ];
    
    return (isIAChart ? iaLabels : culturaLabels).slice(0, length);
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