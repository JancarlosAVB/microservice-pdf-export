const fs = require('fs');
const path = require('path');
const { PdfService } = require('./dist/services/pdf.service');

// Dados de teste para gráficos de radar
const iaChartData = {
  labels: ['Estratégia', 'Governança', 'Dados', 'Infraestrutura', 'Pessoas', 'Operações', 'Integração', 'Inovação'],
  datasets: [
    {
      label: 'Maturidade IA',
      data: [3, 4, 3, 5, 4, 3, 5, 4],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      pointBorderColor: '#fff'
    }
  ],
  width: 300,
  height: 300
};

const culturaChartData = {
  labels: ['Liderança', 'Colaboração', 'Aprendizado', 'Experimentação', 'Agilidade', 'Satisfação', 'Autonomia', 'Propósito'],
  datasets: [
    {
      label: 'Cultura',
      data: [4, 3, 5, 4, 3, 4, 5, 4],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      pointBorderColor: '#fff'
    }
  ],
  width: 300,
  height: 300
};

const options = {
  title: 'Relatório de Diagnóstico - Teste de Ícones',
  author: 'Singulari',
  subject: 'Teste de Ícones SVG no PDF',
  pageSize: 'A4',
  pageOrientation: 'portrait'
};

async function generateTestPDF() {
  try {
    console.log('Iniciando geração do PDF com ícones SVG...');
    
    // Verificar se os ícones existem
    const iconsPath = path.join(__dirname, 'assets', 'icons');
    console.log(`Verificando ícones em: ${iconsPath}`);
    
    const lampada = path.join(iconsPath, 'lampada-de-ideia.svg');
    const quebraCabeca = path.join(iconsPath, 'quebra-cabeca.svg');
    const foguete = path.join(iconsPath, 'foguete.svg');
    
    console.log(`lampada-de-ideia.svg existe: ${fs.existsSync(lampada)}`);
    console.log(`quebra-cabeca.svg existe: ${fs.existsSync(quebraCabeca)}`);
    console.log(`foguete.svg existe: ${fs.existsSync(foguete)}`);
    
    // Inicializar o serviço de PDF
    const pdfService = new PdfService();
    
    console.log('Gerando PDF de diagnóstico...');
    const pdfStream = await pdfService.generateDiagnosticPdf(iaChartData, culturaChartData, options);
    
    // Criar arquivo de saída
    const outputPath = path.join(__dirname, 'teste-icones-novo.pdf');
    const writeStream = fs.createWriteStream(outputPath);
    
    // Pipe do stream para o arquivo
    pdfStream.pipe(writeStream);
    
    writeStream.on('finish', () => {
      console.log(`PDF com ícones gerado com sucesso: ${outputPath}`);
    });
    
    writeStream.on('error', (err) => {
      console.error('Erro ao salvar o PDF:', err);
    });
    
  } catch (error) {
    console.error('Erro ao gerar o PDF:', error);
  }
}

// Executar a função
generateTestPDF(); 