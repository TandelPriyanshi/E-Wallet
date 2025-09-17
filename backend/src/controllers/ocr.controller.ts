import { Request, Response } from 'express';
import { ocrService } from '../services/ocr.service';
import { ProcessImageDto } from '../dtos/ocr/process-image.dto';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import logger from '../utils/logger';

class OCRController {
  public async processImage(req: Request, res: Response) {
    try {
      logger.info('OCR process image request received');
      logger.info('Request body:', req.body);
      logger.info('Request file:', req.file);
      
      // Check if file was uploaded
      if (!req.file) {
        logger.error('No file uploaded in OCR process request');
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }
      
      const imagePath = req.file.path;
      logger.info(`Processing OCR for image: ${imagePath}`);
      
      const result = await ocrService.processImage(imagePath);
      
      logger.info('OCR processing completed successfully');
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in OCR processing:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process image'
      });
    }
  }

  public async extractText(req: Request, res: Response) {
    try {
      logger.info('OCR extract text request received');
      logger.info('Request body:', req.body);
      logger.info('Request file:', req.file);
      
      // Check if file was uploaded
      if (!req.file) {
        logger.error('No file uploaded in OCR extract text request');
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }
      
      const imagePath = req.file.path;
      logger.info(`Extracting text from image: ${imagePath}`);
      
      const text = await ocrService.extractTextFromImage(imagePath);
      
      logger.info('Text extraction completed successfully');
      res.status(200).json({
        success: true,
        data: { text }
      });
    } catch (error) {
      logger.error('Error extracting text:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to extract text'
      });
    }
  }
}

export const ocrController = new OCRController();
