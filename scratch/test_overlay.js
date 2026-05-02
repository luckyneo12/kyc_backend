const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function testOverlay() {
  try {
    const pdfPath = path.resolve(__dirname, '../../../StockologySecuritiesPvt_10 (2) (2)_compressed.pdf');
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Get the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`Page 1 size: ${width} x ${height}`);

    // Draw some test text in the middle of the page
    firstPage.drawText('TEST DATA OVERLAY', {
      x: width / 2 - 50,
      y: height / 2,
      size: 20,
      color: rgb(1, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(path.resolve(__dirname, 'test_overlay.pdf'), pdfBytes);
    console.log("Created test_overlay.pdf");
  } catch (error) {
    console.error("Error:", error);
  }
}

testOverlay();
