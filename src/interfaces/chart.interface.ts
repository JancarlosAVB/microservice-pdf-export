export interface RadarChartData {
  labels: string[];
  datasets: ChartDataset[];
  title?: string;
  width?: number;
  height?: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointRadius?: number;
  fill?: boolean | string;
}

export interface PdfOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  fileName?: string;
  pageSize?: 'A4' | 'A3' | 'LETTER' | string;
  pageOrientation?: 'portrait' | 'landscape';
  // Campos adicionais para o diagnóstico
  iaScore?: number;
  culturaScore?: number;
  iaLevel?: string;
  culturaLevel?: string;
  company?: string;
  diagnosticText?: string;
  skipCombinedAnalysis?: boolean; // Se true, pula a exibição da análise combinada
  recommendations?: {
    pontosFortes?: string[];
    areasMelhoria?: string[];
    recomendacoes?: string[];
  };
}

export interface ChartRequest {
  chartData: RadarChartData;
  pdfOptions?: PdfOptions;
}

export interface DiagnosticChartRequest {
  iaChartData: RadarChartData;
  culturaChartData: RadarChartData;
  pdfOptions?: PdfOptions;
  rawData?: {
    ia: number[];
    cultura: number[];
  };
  formData?: Record<string, any>;
  analysis?: {
    iaLevel?: string;
    culturaLevel?: string;
    combinedKey?: string;
    diagnosticText?: string;
    companyMeaning?: string[];
    recommendations?: {
      pontos_fortes?: string[];
      areas_melhoria?: string[];
      recomendacoes?: string[];
    };
  };
}