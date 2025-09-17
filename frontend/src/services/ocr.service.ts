import axios from 'axios';
import api from './api';
import { OCRResponse, ExtractTextResponse, BillData } from '../features/OCR/types/ocr.types';
import mockOCRService from './ocr.mock.service';

class OCRService {
  /**
   * Process an image and extract bill data using OCR
   */
  async processImage(file: File): Promise<BillData> {
    const formData = new FormData();
    // Ensure we're using the correct field name that matches backend's multer configuration
    formData.append('image', file, file.name);

    try {
      console.log('Sending request to /api/ocr/process with file:', file.name);
      
      // Create a clean axios instance without the default content-type header
      const uploadApi = axios.create({
        baseURL: 'http://localhost:3001', // Make sure this matches your backend URL
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        timeout: 30000, // 30 seconds timeout
      });
      
      const response = await uploadApi.post<OCRResponse>('/api/ocr/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Received response from /api/ocr/process:', response.data);

      if (response.data && response.data.success) {
        if (!response.data.data) {
          console.error('No data received in response:', response);
          throw new Error('Received empty response from server');
        }
        return response.data.data;
      } else {
        const errorMsg = response.data?.message || 'Failed to process image';
        console.error('Server returned error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error processing image with OCR:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        const errorMessage = error.response.data?.message || 
          `Server responded with status ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('The server did not respond. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        throw new Error(`Failed to process image: ${error.message}`);
      }
    }
  }

  /**
   * Extract raw text from an image using OCR
   */
  async extractText(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    try {
      console.log('Sending request to /api/ocr/extract-text with file:', file.name);
      
      // Create a clean axios instance without the default content-type header
      const uploadApi = axios.create({
        baseURL: 'http://localhost:3001', // Make sure this matches your backend URL
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        timeout: 30000, // 30 seconds timeout
      });
      
      const response = await uploadApi.post<ExtractTextResponse>('/api/ocr/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Received response from /api/ocr/extract-text:', response.data);

      if (response.data && response.data.success) {
        if (!response.data.data || !response.data.data.text) {
          console.error('No text data received in response:', response);
          throw new Error('No text was extracted from the image');
        }
        return response.data.data.text;
      } else {
        const errorMsg = response.data?.message || 'Failed to extract text';
        console.error('Server returned error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error extracting text with OCR:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        
        const errorMessage = error.response.data?.message || 
          `Server responded with status ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('The server did not respond. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        throw new Error(`Failed to extract text: ${error.message}`);
      }
    }
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

export const ocrService = new OCRService();
export default ocrService;
