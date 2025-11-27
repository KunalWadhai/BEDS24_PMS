import express from 'express';
const router = express.Router();

import {setupInventory, checkAvailability, getInventory} from '../controllers/inventory.controller.js';

// Inventory routes
router.post('/inventory/setup/:propertyId', setupInventory);
router.get('/inventory/availability', checkAvailability);
router.get('/inventory/:propertyId', getInventory);

export default router;
