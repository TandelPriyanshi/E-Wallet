import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { config } from '../config/config';
import { ApiResponse } from '../utils/response';
import { auth } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const fileRouter = Router();

// Serve uploaded files
fileRouter.get('/uploads/:userId/:filename', auth, (req: AuthenticatedRequest, res) => {
  try {
    const { userId, filename } = req.params;
    const filePath = path.join(config.upload.dir, userId, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return ApiResponse.notFound(res, 'File not found');
    }

    // Check if the user has access to this file
    if (req.user?.id.toString() !== userId) {
      return ApiResponse.forbidden(res, 'Access denied');
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle errors
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        return ApiResponse.error(res, 'Error streaming file');
      }
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return ApiResponse.error(res, 'Error serving file');
  }
});

export default fileRouter;
