const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const fs = require('fs');
const path = require('path');

async function findKeywords() {
  const pdfPath = path.resolve(__dirname, '../../../StockologySecuritiesPvt_10 (2) (2)_compressed.pdf');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  
  const numPages = pdfDocument.numPages;
  console.log(`Scanning ${numPages} pages for keywords...`);
  
  const keywords = ['PAN', 'Name', 'Signature', 'Address', 'DOB', 'Aadhaar', 'Date of Birth', 'Bank'];
  
  for (let pageNum = 1; pageNum <= Math.min(10, numPages); pageNum++) { // Only scan first 10 pages for speed
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    textContent.items.forEach(item => {
      const text = item.str.trim();
      if (text.length > 2) {
        keywords.forEach(kw => {
          if (text.toLowerCase().includes(kw.toLowerCase())) {
             console.log(`Page ${pageNum}: "${text}" -> X: ${item.transform[4]}, Y: ${item.transform[5]}`);
          }
        });
      }
    });
  }
}

findKeywords().catch(console.error);
