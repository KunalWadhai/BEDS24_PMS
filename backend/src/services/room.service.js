
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


  async findRoomTypeByRoomId(propertyId, roomId) {
    const roomTypes = await this.getRoomTypes(propertyId);
    const rid = Number(roomId);

    let found = roomTypes.find(rt => Number(rt.id) === rid || Number(rt.roomId) === rid);
    if (found) return found;

    for (const rt of roomTypes) {
      if (!rt.units) continue;
      if (Array.isArray(rt.units) && rt.units.some(u => Number(u.id) === rid || Number(u.unitId) === rid)) {
        return rt; 
      }
    }

    return null;
  }

 
  getBetterRoomTypesOrdered(currentRoomType, allRoomTypes, rankOverrides = null) {
    const curId = Number(currentRoomType?.id);

    if (Array.isArray(rankOverrides) && rankOverrides.length > 0) {
      const ordering = [];
      for (const name of rankOverrides) {
        const found = allRoomTypes.find(rt => rt.name && rt.name.toLowerCase() === name.toLowerCase());
        if (found && Number(found.id) !== curId) ordering.push(found);
      }
      return ordering;
    }

    const types = allRoomTypes.slice();
    types.sort((a, b) => {
      const scoreA = (Number(a.rackRate) || 0) + (Number(a.sellPriority) || 0) * 0.0001;
      const scoreB = (Number(b.rackRate) || 0) + (Number(b.sellPriority) || 0) * 0.0001;
      return scoreB - scoreA; // descending: highest first
    });

    const idx = types.findIndex(t => Number(t.id) === curId || Number(t.roomId) === curId);
    if (idx === -1) {
      // current not found — return full list excluding current id if present
      return types.filter(t => Number(t.id) !== curId && Number(t.roomId) !== curId);
    }
    if (idx === 0) return []; // already highest
    // return only those better than current (index < idx)
    return types.slice(0, idx).filter(t => Number(t.id) !== curId);
  }
}

export const roomService = new RoomService();
