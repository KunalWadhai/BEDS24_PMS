import { client, wrapAxiosError } from '../utils/httpClient.js';

class InventoryService {
  async setInventoryItems(items = []) {
    try {
      // items: [{ roomTypeId: 11, from: '2025-12-01', to: '2025-12-31', quantity: 5 }]
      const res = await client.post('/inventory', items);
      return res.data;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }

  async checkAvailability(propertyId, roomTypeIds = [], from, to) {
    try {
      const body = {
        propertyId: Number(propertyId),
        roomTypeIds: roomTypeIds.map(id => Number(id)),
        from,
        to
      };
      const res = await client.post('/availability', body);
      return res.data;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }

}

export const inventoryService = new InventoryService();
