import { Router } from 'express';
import { FormController } from '../controllers/form.controller';

const router = Router();
const formController = new FormController();

// Rota para processar dados do formulário
router.post('/process', (req, res) => formController.processFormData(req, res));

// Rota para gerar variações de uma resposta específica
router.post('/variations', (req, res) => formController.generateVariations(req, res));

export default router; 