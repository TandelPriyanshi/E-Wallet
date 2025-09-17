import { ocrService } from '../services/ocr.service';
import path from 'path';
import fs from 'fs';

// Path to a sample bill image in your uploads directory
const TEST_IMAGE_PATH = path.join(__dirname, '../../uploads/bill-1756062570541-537412446.jpg');

// Add global Jest types
declare const describe: any;
declare const it: any;
declare const expect: any;

describe('OCR Service', () => {
  it('should be defined', () => {
    expect(ocrService).toBeDefined();
  });

  describe('processImage', () => {
    it('should process a bill image and extract text', async () => {
      // Skip test if test image doesn't exist
      if (!fs.existsSync(TEST_IMAGE_PATH)) {
        console.warn('Test image not found, skipping OCR test');
        return;
      }

      // Process the test image
      const result = await ocrService.processImage(TEST_IMAGE_PATH);

      // Basic assertions
      expect(result).toBeDefined();
      expect(result.rawText).toBeDefined();
      expect(result.rawText.length).toBeGreaterThan(0);

      console.log('Extracted Text:', result.rawText);
      
      if (result.totalAmount) {
        console.log('Total Amount:', result.totalAmount);
      }
      if (result.date) {
        console.log('Date:', result.date);
      }
      if (result.vendorName) {
        console.log('Vendor:', result.vendorName);
      }
      if (result.items && result.items.length > 0) {
        console.log('Items:', result.items);
      }
    }, 30000); // 30s timeout for OCR processing
  });
});
