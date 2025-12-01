import express from 'express';
const router = express.Router();

import {addRoomTypes, addUnits, listRoomTypes} from '../controllers/room.controller.js';

// Room routes
router.post('/properties/:propertyId/roomtypes', addRoomTypes);
router.post('/properties/:propertyId/roomtypes/:roomTypeId/units', addUnits);
router.get('/properties/:propertyId/roomtypes', listRoomTypes);

export default router;