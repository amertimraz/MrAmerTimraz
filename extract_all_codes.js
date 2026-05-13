const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const imageFolder = 'f:/Amer/Mr Amer Platform/50/';

async function extractCodeFromImage(imagePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'ara+eng');
    return text;
  } catch (error) {
    console.error(`Error: ${imagePath}`, error);
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
  
  // Extract from first few images to understand pattern
  for (let i = 0; i < Math.min(5, imageFiles.length); i++) {
    const imagePath = path.join(imageFolder, imageFiles[i]);
    console.log(`\n=== ${imageFiles[i]} ===`);
    const text = await extractCodeFromImage(imagePath);
    if (text) {
      // Try to extract code blocks (text between ``` or indented)
      const lines = text.split('\n');
      console.log('Raw text:');
      console.log(text);
    }
  }
}

main().catch(console.error);
