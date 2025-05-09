const fs = require('fs');
const path = require('path');
const { PdfService } = require('./dist/services/pdf.service');
const PDFDocument = require('pdfkit');

async function testarSvgDireto() {
  try {
    console.log('Iniciando teste direto de renderização SVG...');
    
    // Verificar se os ícones existem
    const iconsPath = path.join(__dirname, 'assets', 'icons');
    console.log(`Verificando ícones em: ${iconsPath}`);
    
    const lampada = path.join(iconsPath, 'lampada-de-ideia.svg');
    const quebraCabeca = path.join(iconsPath, 'quebra-cabeca.svg');
    const foguete = path.join(iconsPath, 'foguete.svg');
    
    console.log(`lampada-de-ideia.svg existe: ${fs.existsSync(lampada)}`);
    console.log(`quebra-cabeca.svg existe: ${fs.existsSync(quebraCabeca)}`);
    console.log(`foguete.svg existe: ${fs.existsSync(foguete)}`);
    
    // Criar um documento PDF direto para teste
    const outputPath = path.join(__dirname, 'teste-svg-direto.pdf');
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: 'Teste de Renderização SVG',
        Author: 'Singulari',
        Subject: 'Teste de SVG no PDF'
      }
    });
    
    // Criar o stream de saída
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);
    
    // Adicionar título
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Teste de Renderização SVG', { align: 'center' })
       .moveDown(1);
    
    // Adicionar subtítulo
    doc.fontSize(14)
       .font('Helvetica')
       .text('Versão com extração de paths', { align: 'center' })
       .moveDown(2);
    
    // Inicializar o serviço de PDF (onde está nosso método drawSvgIcon)
    const pdfService = new PdfService();
    
    // Modificar o objeto PdfService para usar o caminho correto
    // Substitui o método original drawSvgIcon por uma versão que usa o caminho correto
    const originalDrawSvgIcon = pdfService['drawSvgIcon'];
    
    pdfService['drawSvgIcon'] = function(doc, iconName, x, y, size = 20) {
      try {
        // Usar o caminho absoluto correto para os ícones
        const iconPath = path.join(__dirname, 'assets', 'icons', `${iconName}.svg`);
        console.log(`Tentando carregar ícone de: ${iconPath}`);
        
        if (fs.existsSync(iconPath)) {
          console.log(`SVG encontrado: ${iconName}.svg`);
          
          // Ler o conteúdo do SVG
          const svgContent = fs.readFileSync(iconPath, 'utf8');
          
          // A partir daqui o código é semelhante ao do PdfService.drawSvgIcon
          // Extrair valores do viewBox para dimensionar corretamente
          let viewBox = [0, 0, 24, 24]; // Valor padrão de viewBox
          const viewBoxMatch = svgContent.match(/viewBox=["']([^"']*)["']/i);
          
          if (viewBoxMatch && viewBoxMatch[1]) {
            viewBox = viewBoxMatch[1].split(/\s+/).map(Number);
          }
          
          // Desenhar o fundo arredondado
          const bgSize = size + 10;
          const cornerRadius = 5;
          
          doc.roundedRect(x - 15, y - 15, bgSize, bgSize, cornerRadius)
             .fillColor('#cad64a') // Verde - usando valor direto em vez de this.colors
             .fill();
             
          // Calcular a escala e posição para centralizar o SVG
          const originalWidth = viewBox[2] - viewBox[0];
          const originalHeight = viewBox[3] - viewBox[1];
          const scale = size / Math.max(originalWidth, originalHeight) * 0.8;
          
          // Calcular deslocamento para centralizar
          const xOffset = x - (originalWidth * scale / 2);
          const yOffset = y - (originalHeight * scale / 2);
          
          // Salvar o estado atual do documento
          doc.save();
          
          // Transladar para a posição desejada e aplicar escala
          doc.translate(xOffset, yOffset);
          doc.scale(scale);
          
          // Aplicar a cor dos ícones
          doc.fillColor('#40528d'); // Azul
          
          try {
            // Extrair e desenhar os caminhos do SVG
            const pathMatch = svgContent.match(/<path\s+[^>]*d=["']([^"']*)["'][^>]*>/gi);
            
            if (pathMatch) {
              // Se encontrou caminhos SVG, renderizar cada um
              pathMatch.forEach(pathElement => {
                const dAttrMatch = pathElement.match(/d=["']([^"']*)["']/i);
                
                if (dAttrMatch && dAttrMatch[1]) {
                  // Verificar se o caminho tem estilo de preenchimento
                  const fillMatch = pathElement.match(/fill=["']([^"']*)["']/i);
                  if (fillMatch && fillMatch[1] === 'none') {
                    // Apenas contorno
                    doc.path(dAttrMatch[1]).stroke();
                  } else {
                    // Preenchimento
                    doc.path(dAttrMatch[1]).fill();
                  }
                }
              });
              
              // Restaurar o estado do documento
              doc.restore();
              return;
            }
          } catch (pathError) {
            console.warn(`Erro ao processar os caminhos SVG: ${pathError}`);
            doc.restore(); // Garantir que o estado seja restaurado em caso de erro
          }
          
          // Se não conseguir renderizar o SVG diretamente, tentar usar um círculo como fallback
          doc.restore();
          doc.circle(x, y, size / 3)
             .fillColor('#40528d')
             .fill();
             
          doc.fontSize(size / 3)
             .font('Helvetica-Bold')
             .fillColor('#FFFFFF')
             .text(iconName.charAt(0).toUpperCase(), 
                  x - size / 8, 
                  y - size / 6, 
                  { align: 'center' });
        } else {
          console.error(`Ícone '${iconName}.svg' não encontrado em: ${iconPath}`);
          // Usar o ícone básico como fallback
          this.drawIcon(doc, iconName, x, y, size);
        }
      } catch (error) {
        console.error(`Erro ao adicionar ícone SVG '${iconName}':`, error);
        // Usar o ícone básico como fallback em caso de erro
        this.drawIcon(doc, iconName, x, y, size);
      }
    };
    
    // Testar os métodos de renderização direta
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Ícone de Lâmpada (PONTOS FORTES)', 50, 150);
    
    // Acessar o método privado usando um truque
    pdfService['drawSvgIcon'](doc, 'lampada-de-ideia', 100, 200, 40);
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Ícone de Quebra-Cabeça (ÁREAS DE MELHORIA)', 50, 250);
    
    pdfService['drawSvgIcon'](doc, 'quebra-cabeca', 100, 300, 40);
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Ícone de Foguete (RECOMENDAÇÕES)', 50, 350);
    
    pdfService['drawSvgIcon'](doc, 'foguete', 100, 400, 40);
    
    // Adicionar nova página para comparação com o método fallback original
    doc.addPage();
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Método Fallback Original', { align: 'center' })
       .moveDown(2);
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Ícone de Lâmpada (fallback)', 50, 150);
    
    pdfService['drawIcon'](doc, 'lampada', 100, 200, 40);
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Ícone de Quebra-Cabeça (fallback)', 50, 250);
    
    pdfService['drawIcon'](doc, 'quebra-cabeca', 100, 300, 40);
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Ícone de Foguete (fallback)', 50, 350);
    
    pdfService['drawIcon'](doc, 'foguete', 100, 400, 40);
    
    // Finalizar o documento
    doc.end();
    
    console.log(`PDF de teste gerado em: ${outputPath}`);
    console.log('Verifique o arquivo para confirmar se os SVGs foram renderizados corretamente');
    
  } catch (error) {
    console.error('Erro ao gerar o PDF de teste:', error);
  }
}

// Executar o teste
testarSvgDireto(); 