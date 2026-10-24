import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Apply authentication to all vehicle endpoints
router.use(authenticate);

// Specific routes first to avoid parameter collision
router.get('/search', VehicleController.search);

// General CRUD
router.post('/', VehicleController.create);
router.get('/', VehicleController.getAll);
router.put('/:id', VehicleController.update);
router.delete('/:id', requireAdmin, VehicleController.delete);

// Inventory actions
router.post('/:id/purchase', VehicleController.purchase);
router.post('/:id/restock', requireAdmin, VehicleController.restock);

export default router;
