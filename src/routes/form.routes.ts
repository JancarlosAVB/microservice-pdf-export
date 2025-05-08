import { Router, Request, Response } from 'express';
import { FormController } from '../controllers/form.controller';

const router = Router();
const formController = new FormController();

// Rota para processar dados do formulário e gerar PDF
router.post('/diagnostic-pdf', async (req: Request, res: Response) => {
    await formController.processFormData(req, res);
});

// Rota para gerar variações
router.post('/variations', async (req: Request, res: Response) => {
    await formController.generateVariations(req, res);
});

export default router; 