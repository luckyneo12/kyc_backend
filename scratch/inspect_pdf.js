const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function inspectPdf() {
  try {
    const pdfPath = path.resolve(__dirname, '../../../StockologySecuritiesPvt_10 (2) (2)_compressed.pdf');
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`Found ${fields.length} form fields.`);
    fields.forEach(field => {
      console.log(`- ${field.getName()} (${field.constructor.name})`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

inspectPdf();
