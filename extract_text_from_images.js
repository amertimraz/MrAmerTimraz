const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const imageFolder = 'f:/Amer/Mr Amer Platform/50/';

async function extractTextFromImage(imagePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'ara+eng');
    return text;
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error);
    return null;
  }
}

async function main() {
  const imageFiles = fs.readdirSync(imageFolder)
    .filter(f => f.startsWith('Tofas') && f.endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\((\d+)\)/)?.[1] || 0);
      const numB = parseInt(b.match(/\((\d+)\)/)?.[1] || 0);
      return numA - numB;
    });

  console.log(`Found ${imageFiles.length} images`);

  for (let i = 0; i < Math.min(5, imageFiles.length); i++) {
    const imagePath = path.join(imageFolder, imageFiles[i]);
    console.log(`\nProcessing: ${imageFiles[i]}`);
    const text = await extractTextFromImage(imagePath);
    if (text) {
      console.log('Extracted text:');
      console.log(text);
      console.log('---');
    }
  }
}

main().catch(console.error);
