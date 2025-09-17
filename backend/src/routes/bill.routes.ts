import { Router } from 'express';
import { 
  uploadBill, 
  getBills, 
  updateBill, 
  getBillById, 
  searchBills, 
  deleteBill,
  getCategories,
  categorizeBill
} from '../controllers/bill.controller';
import { auth } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { UpdateBillDto, SearchBillDto } from '../dtos/bill.dto';

const router = Router();

// All routes are protected - require authentication
router.use(auth);

// Categories - must be before :id route
router.get('/categories', getCategories);
router.post('/categorize', categorizeBill);

// Bill operations
router.post('/upload', uploadBill);
router.get('/', getBills);
router.get('/search', searchBills);
router.get('/:id', getBillById);
router.put('/:id', validateDto(UpdateBillDto), updateBill);
router.delete('/:id', deleteBill);

export default router;

