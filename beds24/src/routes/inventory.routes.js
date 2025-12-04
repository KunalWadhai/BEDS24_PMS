import express from 'express';
import { setInventory } from '../controllers/inventory.controller.js';
const router = express.Router();

router.post('/inventory', setInventory);

export default router;
