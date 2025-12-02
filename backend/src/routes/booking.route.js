import express from 'express';
const router = express.Router();
import { getAllBooking } from '../controllers/booking.controller.js';

router.get('/booking/getAllBookingUnderProperty/:propertyId', getAllBooking);

export default router;