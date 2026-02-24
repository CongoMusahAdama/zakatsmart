import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    deactivateAccount,
    getAllUsers,
} from '../controllers/user.controller.js';
import { protect, restrict } from '../middleware/auth.middleware.js';

const router = Router();

// All user routes require authentication
router.use(protect);

// Own profile
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.delete('/profile', deactivateAccount);

// Admin only — list all users
router.get('/', restrict('admin'), getAllUsers);

export default router;
