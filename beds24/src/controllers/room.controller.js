import { roomService } from '../services/room.service.js';

export const addRoomTypes = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { roomTypes } = req.body;
    if (!propertyId || !Array.isArray(roomTypes) || roomTypes.length === 0) {
      return res.status(400).json({ success: false, error: 'propertyId and roomTypes[] are required' });
    }
    const resp = await roomService.addRoomTypes(propertyId, roomTypes);
    res.json({ success: true, data: resp });
  } catch (err) {
    next(err);
  }
};

export const addUnits = async (req, res, next) => {
  try {
    const { propertyId, roomTypeId } = req.params;
    const { units } = req.body;
    if (!propertyId || !roomTypeId || !Array.isArray(units) || units.length === 0) {
      return res.status(400).json({ success: false, error: 'propertyId, roomTypeId and units[] are required' });
    }
    const resp = await roomService.addUnitsToRoomType(propertyId, roomTypeId, units);
    res.json({ success: true, data: resp });
  } catch (err) {
    next(err);
  }
};
