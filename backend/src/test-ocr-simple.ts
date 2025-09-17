import { createWorker } from 'tesseract.js';
import path from 'path';
import fs from 'fs';

async function run() {
  const imagePath = path.join(__dirname, '../uploads/bill-1756064081169-716761657.jpg');
  
  if (!fs.existsSync(imagePath)) {
    console.error('Test image not found');
    return;
  }

  console.log('Starting OCR...');
  
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(imagePath);
    console.log('Extracted Text:', text.substring(0, 500) + '...');
  } catch (error) {
    console.error('Error during OCR:', error);
  } finally {
    await worker.terminate();
  }
}

run().catch(console.error);
