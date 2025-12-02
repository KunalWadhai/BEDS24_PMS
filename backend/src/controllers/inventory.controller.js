import { roomService } from '../services/room.service.js';
import { inventoryService } from '../services/inventory.service.js';
import { isIsoDateString } from '../utils/date.js';

export const setInventory = async (req, res, next) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'items[] required' });
    }
    const resp = await inventoryService.setInventoryItems(items);
    res.json({ success: true, data: resp });
  } catch (err) {
    next(err);
  }
};

// body: { requestedType: 'Standard', from: '2025-12-01', to: '2025-12-05', fallbackOrder: ['Deluxe','Superior'] }
export const findBestRoom = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { requestedType, from, to, fallbackOrder = [] } = req.body;

    if (!propertyId || !requestedType || !from || !to) {
      return res.status(400).json({ success: false, error: 'propertyId, requestedType, from, to are required' });
    }
    if (!isIsoDateString(from) || !isIsoDateString(to)) {
      return res.status(400).json({ success: false, error: 'from and to must be in YYYY-MM-DD' });
    }

    const checkOrder = [requestedType, ...fallbackOrder];
    const roomTypes = await roomService.getRoomTypes(propertyId);
    const byName = {};
    for (const rt of roomTypes) {
      if (rt.name) byName[rt.name.toLowerCase()] = rt;
    }

    for (const typeName of checkOrder) {
      const rt = byName[typeName.toLowerCase()];
      if (!rt) continue;

      const avail = await inventoryService.checkRoomAvailability(propertyId, [rt.id], from, to);
      const ok = evaluateAvailabilityResponse(avail, rt.id);
      if (ok) {
        return res.json({
          success: true,
          selected: {
            roomType: rt,
            availability: avail
          }
        });
      }
    }

    return res.status(404).json({ success: false, error: 'No available room for selected types and dates' });
  } catch (err) {
    next(err);
  }
};

function evaluateAvailabilityResponse(availResp, roomTypeId) {
  if (!availResp) return false;

  // If API returns object keyed by roomTypeId
  if (typeof availResp === 'object' && !Array.isArray(availResp)) {
    // try direct key
    if (availResp[roomTypeId]) {
      const info = availResp[roomTypeId];
      if (Array.isArray(info)) {
        return info.every(d => (d.available || d.quantity || d.availableQty || d.qty) > 0);
      } else if (info.days && Array.isArray(info.days)) {
        return info.days.every(d => (d.available || d.quantity || d.availableQty || d.qty) > 0);
      }
    }
    // top-level array fallback
    if (Array.isArray(availResp)) {
      return availResp.every(d => (d.available || d.quantity || d.availableQty || d.qty) > 0);
    }
  }

  if (Array.isArray(availResp)) {
    return availResp.every(d => (d.available || d.quantity || d.availableQty || d.qty) > 0);
  }

  return false;
}
