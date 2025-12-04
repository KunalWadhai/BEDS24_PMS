
import express from 'express';
import { checkNextDayUpgrades } from '../controllers/upgrade.controller.js';
const router = express.Router();

router.post('/properties/:propertyId/check-next-day-arrival-bookings', checkNextDayUpgrades);

export default router;
