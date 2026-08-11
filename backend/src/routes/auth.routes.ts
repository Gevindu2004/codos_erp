import { Router } from 'express';
import { registerUser } from '../controllers/auth.controller';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (for now)
router.post('/register', registerUser);

export default router;
