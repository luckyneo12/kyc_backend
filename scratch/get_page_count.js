const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function getPageCount() {
  try {
    const pdfPath = path.resolve(__dirname, '../../../StockologySecuritiesPvt_10 (2) (2)_compressed.pdf');
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    
    console.log(`ACTUAL_PAGE_COUNT: ${pages.length}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

getPageCount();
