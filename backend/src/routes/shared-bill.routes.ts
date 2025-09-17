import { Router } from 'express';
import {
  shareBill,
  getSharedBills,
  updateSharedBill,
  revokeSharedBill,
  getSharedBillById
} from '../controllers/shared-bill.controller';
import { auth } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { ShareBillDto, UpdateSharedBillDto, SharedBillsQueryDto } from '../dtos/shared-bill.dto';

const router = Router();

// All routes are protected - require authentication
router.use(auth);

// Share a bill with another user
router.post('/bills/:billId/share', validateDto(ShareBillDto), shareBill);

// Get all shared bills (both shared by me and shared with me)
router.get('/', getSharedBills);

// Get specific shared bill by ID
router.get('/:id', getSharedBillById);

// Update shared bill (owner only)
router.put('/:id', validateDto(UpdateSharedBillDto), updateSharedBill);

// Revoke shared bill (owner only)
router.delete('/:id', revokeSharedBill);

export default router;
