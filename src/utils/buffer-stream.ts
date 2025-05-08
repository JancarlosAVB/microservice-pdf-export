import { Writable } from 'stream';

/**
 * Classe personalizada para capturar os chunks do PDF em um buffer
 * Implementa a interface Writable do Node.js corretamente
 */
export class WritableBufferStream extends Writable {
  private chunks: Buffer[] = [];
  private onFinish: (buffer: Buffer) => void;

  constructor(onFinish: (buffer: Buffer) => void) {
    super();
    this.onFinish = onFinish;
    
    // Implementar evento 'finish' para chamar onFinish com o buffer completo
    this.on('finish', () => {
      const buffer = Buffer.concat(this.chunks);
      this.onFinish(buffer);
    });
  }

  _write(chunk: Buffer, encoding: string, callback: (error?: Error | null) => void): void {
    this.chunks.push(chunk);
    callback();
  }
} 