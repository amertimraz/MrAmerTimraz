const fs = require('fs');
const pdfParse = require('pdf-parse/dist/pdf-parse.js');

async function readPDF() {
    try {
        const dataBuffer = fs.readFileSync('امتحانات نهاية العام 3 اعدادي من الفائز.pdf');
        const data = await pdfParse(dataBuffer);
        
        console.log('PDF Content:');
        console.log('================');
        console.log(data.text);
        
        // Look for VB.NET related questions
        const vbnetQuestions = data.text.match(/.*VB\.NET.*\n?.*/g) || [];
        const dimQuestions = data.text.match(/.*Dim.*\n?.*/g) || [];
        const constQuestions = data.text.match(/.*Const.*\n?.*/g) || [];
        
        console.log('\n\nVB.NET Questions:');
        console.log('==================');
        vbnetQuestions.forEach(q => console.log(q.trim()));
        
        console.log('\nDim Questions:');
        console.log('===============');
        dimQuestions.forEach(q => console.log(q.trim()));
        
        console.log('\nConst Questions:');
        console.log('================');
        constQuestions.forEach(q => console.log(q.trim()));
        
    } catch (error) {
        console.error('Error reading PDF:', error);
    }
}

readPDF();
