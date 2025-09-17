export interface BillItem {
  description: string;
  quantity?: string;
  unitPrice?: string;
  amount?: string;
}

export interface BillData {
  totalAmount?: string;
  date?: string;
  vendorName?: string;
  items?: BillItem[];
  rawText: string;
}

export interface OCRResponse {
  success: boolean;
  data: BillData;
  message?: string;
}

export interface ExtractTextResponse {
  success: boolean;
  data: {
    text: string;
  };
  message?: string;
}

export interface OCRProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: 'upload' | 'ocr' | 'parsing' | 'complete' | 'error';
  error?: string;
}
