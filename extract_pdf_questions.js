const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractQuestionsFromPDF() {
    try {
        const dataBuffer = fs.readFileSync('امتحانات نهاية العام 3 اعدادي من الفائز.pdf');
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        console.log('Extracted PDF Text:');
        console.log('===================');
        console.log(fullText);
        
        // Look for question patterns
        const questionPatterns = [
            /(?:أكمل|اختر|ضع|ما هو|ما هي|اذكر|وضح)[^.!?]*[.!?]/g,
            /VB\.NET[^.!?]*[.!?]/g,
            /Dim[^.!?]*[.!?]/g,
            /Const[^.!?]*[.!?]/g,
            /For.*Next[^.!?]*[.!?]/g,
            /If.*Then[^.!?]*[.!?]/g
        ];
        
        console.log('\n\nExtracted Questions:');
        console.log('====================');
        
        let allQuestions = [];
        questionPatterns.forEach(pattern => {
            const matches = fullText.match(pattern) || [];
            allQuestions = allQuestions.concat(matches);
        });
        
        // Remove duplicates and clean up
        const uniqueQuestions = [...new Set(allQuestions)].filter(q => q.trim().length > 10);
        
        uniqueQuestions.forEach((question, index) => {
            console.log(`${index + 1}. ${question.trim()}`);
        });
        
        console.log(`\nTotal questions found: ${uniqueQuestions.length}`);
        
        // Save to file for comparison
        fs.writeFileSync('extracted_questions.txt', uniqueQuestions.join('\n\n'));
        console.log('Questions saved to extracted_questions.txt');
        
    } catch (error) {
        console.error('Error extracting PDF:', error);
    }
}

extractQuestionsFromPDF();
