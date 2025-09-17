import { Router } from 'express';
import { ocrController } from '../controllers/ocr.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { auth } from '../middleware/auth.middleware';

const router = Router();

// Process image with OCR
router.post(
  '/process',
  auth, // Ensure user is authenticated
  uploadMiddleware('image'), // Handle file upload
  ocrController.processImage
);

// Extract text from image
router.post(
  '/extract-text',
  auth, // Ensure user is authenticated
  uploadMiddleware('image'), // Handle file upload
  ocrController.extractText
);

export default router;
