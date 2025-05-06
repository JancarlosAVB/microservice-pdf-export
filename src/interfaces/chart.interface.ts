export interface RadarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    pointBackgroundColor?: string | string[];
    pointBorderColor?: string | string[];
    pointRadius?: number;
    fill?: boolean | string;
  }[];
  title?: string;
  width?: number;
  height?: number;
}

export interface PdfOptions {
  title?: string;
  author?: string;
  subject?: string;
  fileName?: string;
  pageSize?: 'A4' | 'A3' | 'LETTER' | string;
  pageOrientation?: 'portrait' | 'landscape';
}

export interface ChartRequest {
  chartData: RadarChartData;
  pdfOptions?: PdfOptions;
} 