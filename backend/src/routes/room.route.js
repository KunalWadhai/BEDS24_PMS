import express from 'express';
const router = express.Router();

import {addRoomTypes, addUnits} from '../controllers/room.controller.js';

// Room routes
router.post('/properties/:propertyId/roomtypes', addRoomTypes);
router.post('/properties/:propertyId/roomtypes/:roomTypeId/units', addUnits);


export default router;