const fs = require('fs');
const pdf = require('pdfjs-dist');

async function extractText(path) {
    try {
        const data = new Uint8Array(fs.readFileSync(path));
        const loadingTask = pdf.getDocument({data});
        const pdfDocument = await loadingTask.promise;
        
        console.log(`Pages: ${pdfDocument.numPages}`);
        
        // Extract first 5 pages to get the core concepts
        for (let i = 1; i <= Math.min(5, pdfDocument.numPages); i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(' ');
            console.log(`--- Page ${i} ---`);
            console.log(text);
        }
    } catch (error) {
        console.error('Error reading PDF:', error);
    }
}

extractText('برمجة أولى ثانوي.pdf');
