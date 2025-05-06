// Script simples para abrir o PDF gerado
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, 'resultado-diagnostico.pdf');

// Verificar se o arquivo existe
if (fs.existsSync(pdfPath)) {
  console.log(`PDF encontrado em: ${pdfPath}`);
  console.log('Tentando abrir o PDF com o aplicativo padrão...');
  
  // Abrir o PDF com o aplicativo padrão do sistema
  const command = process.platform === 'win32' ? 'start' : 
                 (process.platform === 'darwin' ? 'open' : 'xdg-open');
  
  exec(`${command} "${pdfPath}"`, (error) => {
    if (error) {
      console.error(`Erro ao abrir o PDF: ${error.message}`);
      return;
    }
    console.log('PDF aberto com sucesso!');
  });
} else {
  console.error(`PDF não encontrado em: ${pdfPath}`);
  console.log('Verifique se o arquivo foi gerado corretamente.');
}
