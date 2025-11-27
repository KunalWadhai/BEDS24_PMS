import express from 'express';
const router = express.Router();

import {createRoomTypes, getRoomTypes} from '../controllers/room.controller.js';

// Room routes
router.post('/rooms/create-types/:propertyId', createRoomTypes);
router.get('/rooms/:propertyId', getRoomTypes);

export default router;