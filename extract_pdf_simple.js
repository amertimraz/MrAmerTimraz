const fs = require('fs');
const PDFParser = require('pdf2json');

async function extractPDFText() {
    try {
        const pdfParser = new PDFParser();
        
        pdfParser.on('pdfParser_dataError', errData => {
            console.error(errData.parserError);
        });
        
        pdfParser.on('pdfParser_dataReady', pdfData => {
            let fullText = '';
            
            // Extract text from all pages
            if (pdfData.Pages) {
                pdfData.Pages.forEach((page, pageIndex) => {
                    console.log(`Processing page ${pageIndex + 1}...`);
                    
                    if (page.Texts) {
                        page.Texts.forEach(text => {
                            if (text.R && text.R.length > 0) {
                                text.R.forEach(run => {
                                    if (run.T) {
                                        fullText += decodeURIComponent(run.T) + ' ';
                                    }
                                });
                            }
                        });
                    }
                    fullText += '\n';
                });
            }
            
            console.log('Extracted Text:');
            console.log('================');
            console.log(fullText);
            
            // Look for VB.NET related questions
            const vbnetMatches = fullText.match(/[^.!?]*VB\.NET[^.!?]*[.!?]/g) || [];
            const dimMatches = fullText.match(/[^.!?]*Dim[^.!?]*[.!?]/g) || [];
            const constMatches = fullText.match(/[^.!?]*Const[^.!?]*[.!?]/g) || [];
            const forMatches = fullText.match(/[^.!?]*For[^.!?]*Next[^.!?]*[.!?]/g) || [];
            const ifMatches = fullText.match(/[^.!?]*If[^.!?]*Then[^.!?]*[.!?]/g) || [];
            
            console.log('\n\nVB.NET Questions:');
            console.log('==================');
            vbnetMatches.forEach((match, i) => console.log(`${i+1}. ${match.trim()}`));
            
            console.log('\nDim Questions:');
            console.log('===============');
            dimMatches.forEach((match, i) => console.log(`${i+1}. ${match.trim()}`));
            
            console.log('\nConst Questions:');
            console.log('================');
            constMatches.forEach((match, i) => console.log(`${i+1}. ${match.trim()}`));
            
            console.log('\nFor...Next Questions:');
            console.log('=====================');
            forMatches.forEach((match, i) => console.log(`${i+1}. ${match.trim()}`));
            
            console.log('\nIf...Then Questions:');
            console.log('===================');
            ifMatches.forEach((match, i) => console.log(`${i+1}. ${match.trim()}`));
            
            // Save all extracted text
            fs.writeFileSync('pdf_extracted_text.txt', fullText);
            console.log('\nFull text saved to pdf_extracted_text.txt');
        });
        
        pdfParser.loadPDF('امتحانات نهاية العام 3 اعدادي من الفائز.pdf');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

extractPDFText();
