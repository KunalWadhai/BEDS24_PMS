import { client, wrapAxiosError } from '../utils/httpClient.js';

class InventoryService {
  async setInventoryItems(items = []) {
    try {
      const res = await client.post('/inventory/rooms/calendar', items);
      return res.data;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }

  async getRoomsAvailability(propertyId, startDate, endDate) {
    try {
      const params = new URLSearchParams({
        propertyId: String(propertyId),
        startDate,
        endDate
      });
      const res = await client.get(`/inventory/rooms/availability?${params.toString()}`);
      // return res.data.data (array)
      return res.data;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }

  // helper: check if a roomId is fully available for all dates in returned availability map
  // availabilityObj is like { "2025-12-03": true, "2025-12-04": true, ... }
  isRoomFullyAvailable(availabilityObj) {
    if (!availabilityObj || typeof availabilityObj !== 'object') return false;
    return Object.values(availabilityObj).every(v => v === true || v === 'true' || v === 1);
  }

  // convenience: given API response data array, return boolean if roomId available for all dates
  isRoomIdAvailableInResponse(responseDataArray, roomId) {
    if (!Array.isArray(responseDataArray)) return false;
    const entry = responseDataArray.find(d => Number(d.roomId) === Number(roomId));
    if (!entry) return false;
    return this.isRoomFullyAvailable(entry.availability);
  }

}

export const inventoryService = new InventoryService();
