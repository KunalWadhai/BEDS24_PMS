import express from 'express';
import { setInventory, findBestRoom } from '../controllers/inventory.controller.js';
const router = express.Router();

router.post('/inventory', setInventory);
router.post('/properties/:propertyId/find-room', findBestRoom);

export default router;
