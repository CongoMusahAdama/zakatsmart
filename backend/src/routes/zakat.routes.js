import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
    createCalculation,
    listCalculations,
    getCalculation,
    updateCalculation,
    deleteCalculation,
    markAsPaid,
    getSummary,
} from '../controllers/zakat.controller.js';

const router = Router();

// All zakat routes require authentication
router.use(protect);

router.get('/summary', getSummary);          // GET  /api/zakat/summary

router.route('/')
    .get(listCalculations)                   // GET  /api/zakat
    .post(createCalculation);                // POST /api/zakat

router.route('/:id')
    .get(getCalculation)                     // GET  /api/zakat/:id
    .patch(updateCalculation)                // PATCH /api/zakat/:id
    .delete(deleteCalculation);              // DELETE /api/zakat/:id

router.patch('/:id/mark-paid', markAsPaid); // PATCH /api/zakat/:id/mark-paid

export default router;
