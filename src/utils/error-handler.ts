import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para tratamento de erros
 */
export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Erro não tratado:', err);
  
  const statusCode = 'statusCode' in err ? (err as any).statusCode : 500;
  const message = err.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Middleware para capturar rotas não encontradas
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.originalUrl}`
  });
}; 