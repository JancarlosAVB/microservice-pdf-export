import { Canvas, CanvasRenderingContext2D } from 'canvas';
import { Chart, ChartConfiguration, RadarController, LineElement, PointElement, RadialLinearScale, Tooltip, Legend, Filler } from 'chart.js';
import { RadarChartData } from '../interfaces/chart.interface';

// Registrar os componentes necessários do Chart.js
Chart.register(RadarController, LineElement, PointElement, RadialLinearScale, Tooltip, Legend, Filler);

export class ChartService {
  /**
   * Gera um gráfico radar no canvas fornecido
   * @param canvas Canvas onde o gráfico será desenhado
   * @param chartData Dados para o gráfico radar
   * @returns O objeto Chart criado
   */
  public generateRadarChart(canvas: Canvas, chartData: RadarChartData): Chart {
    // Configurar cores padrão se não fornecidas
    const datasets = chartData.datasets.map(dataset => {
      const defaultColor = this.generateRandomColor(0.6);
      const defaultBorderColor = this.generateRandomColor(1);
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || 'rgba(75, 192, 192, 0.2)',
        borderColor: dataset.borderColor || 'rgba(75, 192, 192, 1)',
        borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : 1,
        pointBackgroundColor: dataset.pointBackgroundColor || defaultBorderColor,
        pointBorderColor: dataset.pointBorderColor || '#fff',
        pointRadius: dataset.pointRadius !== undefined ? dataset.pointRadius : 3,
        fill: dataset.fill !== undefined ? dataset.fill : true
      };
    });

    // Configuração do gráfico
    const config: ChartConfiguration = {
      type: 'radar',
      data: {
        labels: chartData.labels,
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: !!chartData.title,
            text: chartData.title || '',
            font: {
              size: 18
            }
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              backdropColor: 'transparent',
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            pointLabels: {
              color: '#666',
              font: {
                size: 12
              }
            }
          }
        }
      },
    };

    // Criar e retornar o gráfico
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
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