const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Carregar dados do arquivo JSON
const testData = require('./test-diagnostico.json');

// URL do serviço (local ou no Render)
const serviceUrl = 'http://localhost:3000/api/diagnostic-pdf';

console.log('Enviando solicitação para: ' + serviceUrl);
console.log('Enviando dados de teste com estas características:');
console.log(`- IA datasets: ${testData.iaChartData.datasets.length}`);
console.log(`- IA valores: ${testData.iaChartData.datasets[0].data.join(', ')}`);
console.log(`- Cultura datasets: ${testData.culturaChartData.datasets.length}`);
console.log(`- Cultura valores: ${testData.culturaChartData.datasets[0].data.join(', ')}`);
console.log(`- Usando valores diretos: ${testData.formData._use_direct_values}`);
console.log(`- Valores IA diretos: ${testData.formData._ia_values.join(', ')}`);
console.log(`- Valores Cultura diretos: ${testData.formData._cultura_values.join(', ')}`);

async function testDiagnosticPdf() {
  try {
    // Enviar solicitação usando axios
    const response = await axios.post(serviceUrl, testData, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      }
    });
    
    // Salvar o PDF recebido
    const outputPath = path.join(__dirname, 'teste-diagnostico-resultado.pdf');
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`PDF gerado com sucesso e salvo em: ${outputPath}`);
    console.log(`Tamanho do arquivo: ${response.data.length} bytes`);
  } catch (error) {
    console.error('Erro ao gerar o PDF:');
    if (error.response) {
      // O servidor respondeu com um código de status diferente de 2xx
      console.error(`Status: ${error.response.status}`);
      console.error(`Mensagem: ${error.response.statusText}`);
      
      // Se temos dados de erro em formato de texto
      if (error.response.data) {
        try {
          // Tentar converter ArrayBuffer para string
          const errorText = Buffer.from(error.response.data).toString('utf8');
          try {
            // Tentar analisar como JSON
            const errorJson = JSON.parse(errorText);
            console.error('Detalhes do erro:', errorJson);
          } catch (e) {
            // Se não for JSON, mostrar como texto
            console.error('Resposta de erro:', errorText);
          }
        } catch (e) {
          console.error('Não foi possível interpretar a resposta de erro');
        }
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Não houve resposta do servidor');
    } else {
      // Erro na configuração da requisição
      console.error('Erro ao configurar a requisição:', error.message);
    }
  }
}

// Executar o teste
testDiagnosticPdf();
