import { BillData } from '../features/OCR/types/ocr.types';

class MockOCRService {
  /**
   * Mock process image function for testing
   */
  async processImage(file: File): Promise<BillData> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock data
    return {
      totalAmount: "25.99",
      date: "2024-01-15",
      vendorName: "Sample Store",
      items: [
        {
          description: "Coffee",
          quantity: "2",
          unitPrice: "4.50",
          amount: "9.00"
        },
        {
          description: "Croissant",
          quantity: "1",
          unitPrice: "3.25",
          amount: "3.25"
        }
      ],
      rawText: "Sample Store\n123 Main St\nDate: 2024-01-15\n\nCoffee x2     $4.50 ea    $9.00\nCroissant     $3.25 ea    $3.25\nTax                       $2.74\nTotal                    $25.99\n\nThank you for your business!"
    };
  }

  /**
   * Mock extract text function for testing
   */
  async extractText(file: File): Promise<string> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return "Sample Store\n123 Main St\nDate: 2024-01-15\n\nCoffee x2     $4.50 ea    $9.00\nCroissant     $3.25 ea    $3.25\nTax                       $2.74\nTotal                    $25.99\n\nThank you for your business!";
  }

  /**
   * Validate if a file is a supported image format
   */
  isValidImageFile(file: File): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/bmp',
      'image/tiff',
      'image/webp'
    ];
    
    return supportedTypes.includes(file.type.toLowerCase());
  }

  /**
   * Validate file size (max 10MB)
   */
  isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Get formatted file size
   */
  getFormattedFileSize(file: File): string {
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB >= 1) {
      return `${sizeInMB.toFixed(1)} MB`;
    } else {
      const sizeInKB = file.size / 1024;
      return `${sizeInKB.toFixed(1)} KB`;
    }
  }
}

export const mockOCRService = new MockOCRService();
export default mockOCRService;
