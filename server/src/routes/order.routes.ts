import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getOrders, getOrder, createOrderHandler } from '../controllers/order.controller';
const router = Router();
router.use(authenticate);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', createOrderHandler);
export default router;
