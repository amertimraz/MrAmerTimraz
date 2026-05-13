const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imageFolder = 'f:/Amer/Mr Amer Platform/50/';
const outputFolder = 'f:/Amer/Mr Amer Platform/50_processed/';

// Create output folder if not exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

async function preprocessImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .grayscale()
      .normalize()
      .sharpen()
      .toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error('Error preprocessing:', error);
    return inputPath;
  }
}

async function extractTextFromImage(imagePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'ara', {
      logger: m => {}
    });
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

  for (let i = 0; i < Math.min(3, imageFiles.length); i++) {
    const imagePath = path.join(imageFolder, imageFiles[i]);
    const processedPath = path.join(outputFolder, imageFiles[i]);
    
    console.log(`\nProcessing: ${imageFiles[i]}`);
    
    // Preprocess
    await preprocessImage(imagePath, processedPath);
    
    // Extract text
    const text = await extractTextFromImage(processedPath);
    if (text) {
      console.log('Extracted text:');
      console.log(text);
      console.log('---');
    }
  }
}

main().catch(console.error);
