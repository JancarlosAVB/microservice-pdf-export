const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Ler o arquivo de dados de teste
const testData = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-diagnostico.json'), 'utf8'));

async function testDiagnosticPdf() {
  try {
    console.log('Iniciando teste de diagnu00f3stico combinado IA/Cultura...');
    console.log('Enviando dados para processamento...');
    
    // Imprimir algumas informau00e7u00f5es sobre os dados que estu00e3o sendo enviados
    console.log(`Perguntas de IA: ${Object.keys(testData.formData).filter(k => parseInt(k.split('_')[1]) <= 10).length}`);
    console.log(`Perguntas de Cultura: ${Object.keys(testData.formData).filter(k => parseInt(k.split('_')[1]) > 10).length}`);
    
    // Enviar solicitau00e7u00e3o para o endpoint de diagnu00f3stico
    const response = await axios({
      method: 'post',
      url: 'http://localhost:3000/api/diagnostic-pdf',
      data: testData,
      responseType: 'stream'
    });

    // Verificar se a resposta é válida
    if (response.status === 200) {
      console.log('Sucesso! O serviu00e7o gerou o PDF de diagnu00f3stico.');
      
      // Criar um stream de escrita para salvar o PDF
      const outputPath = path.join(__dirname, 'resultado-diagnostico.pdf');
      const writer = fs.createWriteStream(outputPath);
      
      // Pipe a resposta para o arquivo
      response.data.pipe(writer);
      
      // Aguardar a conclusão da escrita
      await new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`PDF salvo com sucesso em: ${outputPath}`);
          resolve();
        });
        writer.on('error', reject);
      });
    } else {
      console.error(`Erro: Resposta com status ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao testar o diagnu00f3stico:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Executar o teste
testDiagnosticPdf();
