import { Router } from 'express';
import { ChartController } from '../controllers/chart.controller';

const router = Router();
const chartController = new ChartController();

// Rota para gerar PDF com gráfico radar
router.post('/radar-chart-pdf', (req, res) => chartController.generateRadarChartPdf(req, res));

export default router; 