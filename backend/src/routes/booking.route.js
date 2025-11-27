import express from 'express';
const router = express.Router();

import {createBooking, 
        createDummyBooking, 
        getBooking, 
        listBookings, 
        cancelBooking} from '../controllers/booking.controller.js';

// Booking routes
router.post('/bookings/create', createBooking);
router.post('/bookings/dummy/:propertyId/:roomTypeId', createDummyBooking);
router.get('/bookings/:bookingId', getBooking);
router.get('/bookings/list/:propertyId', listBookings);
router.patch('/bookings/:bookingId/cancel', cancelBooking);


export default router;