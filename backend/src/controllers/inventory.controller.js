
import { inventoryService } from '../services/inventory.service.js';

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

