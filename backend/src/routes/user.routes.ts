import { Router } from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/user.controller';
import { auth } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { CreateUserDto, LoginUserDto } from '../dtos/user.dto';

const router = Router();

// Public routes
router.post('/register', validateDto(CreateUserDto), registerUser);
router.post('/login', validateDto(LoginUserDto), loginUser);

// Protected routes
router.get('/me', auth, getCurrentUser);

export default router;

