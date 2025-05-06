import { Router } from 'express';
import { ChartController } from '../controllers/chart.controller';

const router = Router();
const chartController = new ChartController();

// Rota para gerar PDF com gráfico radar
router.post('/radar-chart-pdf', (req, res) => chartController.generateRadarChartPdf(req, res));

// Rota para gerar PDF de diagnóstico completo com dois gráficos
router.post('/diagnostic-pdf', (req, res) => chartController.generateDiagnosticPdf(req, res));

export default router;