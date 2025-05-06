// Exemplo de como consumir a API usando fetch (para navegadores modernos)
async function generateRadarChartPdf() {
  try {
    const url = 'http://localhost:3000/api/radar-chart-pdf';
    
    const data = {
      chartData: {
        labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"],
        datasets: [
          {
            label: "Visitantes 2023",
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            pointBackgroundColor: "rgba(75, 192, 192, 1)",
            pointBorderColor: "#fff",
            pointRadius: 3,
            fill: true
          }
        ],
        title: "Radar Chart",
        width: 700,
        height: 500
      },
      pdfOptions: {
        title: "Showing total visitors for the last 6 months",
        author: "Sistema de Relatórios",
        subject: "Análise de Visitantes",
        fileName: "radar-chart-visitors.pdf",
        pageSize: "A4",
        pageOrientation: "portrait"
      }
    };
    
    // Fazendo a requisição para a API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao gerar PDF: ${errorData.message}`);
    }
    
    // Convertendo a resposta para blob (dados binários)
    const blob = await response.blob();
    
    // Criando uma URL para o blob
    const fileURL = URL.createObjectURL(blob);
    
    // Criando um link para download
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = data.pdfOptions.fileName || 'radar-chart.pdf';
    a.style.display = 'none';
    
    // Adicionando ao DOM e clicando para iniciar o download
    document.body.appendChild(a);
    a.click();
    
    // Limpeza
    document.body.removeChild(a);
    URL.revokeObjectURL(fileURL);
    
    console.log('PDF gerado com sucesso!');
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Para usar em Node.js com Axios:
/*
const axios = require('axios');
const fs = require('fs');

async function generateRadarChartPdf() {
  try {
    const url = 'http://localhost:3000/api/radar-chart-pdf';
    
    const data = {
      chartData: {
        labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"],
        datasets: [
          {
            label: "Visitantes 2023",
            data: [65, 59, 80, 81, 56, 55],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            pointBackgroundColor: "rgba(75, 192, 192, 1)",
            pointBorderColor: "#fff",
            pointRadius: 3,
            fill: true
          }
        ],
        title: "Radar Chart",
        width: 700,
        height: 500
      },
      pdfOptions: {
        title: "Showing total visitors for the last 6 months",
        author: "Sistema de Relatórios",
        subject: "Análise de Visitantes",
        fileName: "radar-chart-visitors.pdf"
      }
    };
    
    const response = await axios({
      method: 'post',
      url,
      data,
      responseType: 'stream'
    });
    
    // Salvando o arquivo
    const writer = fs.createWriteStream(data.pdfOptions.fileName || 'radar-chart.pdf');
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

generateRadarChartPdf()
  .then(() => console.log('PDF gerado com sucesso!'))
  .catch(err => console.error('Falha ao gerar PDF:', err));
*/ 