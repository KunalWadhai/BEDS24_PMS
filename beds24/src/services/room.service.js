
import { client, wrapAxiosError } from '../utils/httpClient.js';

class RoomService {
  async addRoomTypes(propertyId, roomTypes = []) {
    try {
      const payload = [
        {
          id: Number(propertyId),
          roomTypes: roomTypes.map(rt => ({
            name: rt.name,
            qty: rt.qty ?? 1,
            maxPeople: rt.maxPeople ?? 1,
            minStay: rt.minStay ?? null,
            maxStay: rt.maxStay ?? null,
            rackRate: rt.rackRate ?? undefined,
            taxPercentage: rt.taxPercentage ?? undefined,
          }))
        }
      ];
      const res = await client.post('/properties', payload);
      return res.data;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }

 
  async addUnitsToRoomType(propertyId, roomTypeId, units = []) {
    try {
      const payload = [
        {
          id: Number(propertyId),
          roomTypes: [
            {
              id: Number(roomTypeId),
              units: units.map(u => ({ name: u.name }))
            }
          ]
        }
      ];
      const res = await client.post('/properties', payload);
      return res.data;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }
}

export const roomService = new RoomService();
