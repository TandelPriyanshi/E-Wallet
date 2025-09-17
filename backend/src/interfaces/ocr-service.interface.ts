import { ProcessReceiptDto } from '../dtos/ocr/process-receipt.dto';

export interface IOCRService {
  processReceipt(processReceiptDto: ProcessReceiptDto): Promise<any>;
  extractTextFromImage(imageUrl: string): Promise<string>;
  parseReceiptText(text: string): Promise<{
    vendor: string;
    date: Date;
    total: number;
    items: Array<{ name: string; price: number; quantity?: number }>;
  }>;
}
