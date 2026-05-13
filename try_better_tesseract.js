const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const imageFolder = 'f:/Amer/Mr Amer Platform/50/';

async function extractTextFromImage(imagePath) {
  try {
    const worker = await Tesseract.createWorker('ara');
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    });
    
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();
    
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

  // Try specific images that match incomplete snippets
  const targetImages = [13, 14, 15, 16, 17, 18, 19, 20]; // Based on incomplete snippet IDs
  
  for (const num of targetImages) {
    const imageFile = imageFiles.find(f => f.includes(`(${num})`));
    if (imageFile) {
      const imagePath = path.join(imageFolder, imageFile);
      console.log(`\nProcessing: ${imageFile}`);
      console.log('========================================');
      const text = await extractTextFromImage(imagePath);
      if (text) {
        console.log('Extracted text:');
        console.log(text);
        console.log('\n========================================');
      }
    }
  }
}

main().catch(console.error);
