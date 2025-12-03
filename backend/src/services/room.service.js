
import { client, wrapAxiosError } from '../utils/httpClient.js';
import { propertyService } from './property.service.js';

class RoomService {
  /**
   * Add or update roomTypes on a property by posting to /properties with id + roomTypes
   * payload example:
   * [
   *   {
   *     id: 12345,
   *     roomTypes: [
   *       { name: "Standard", qty: 5, maxPeople: 2, rackRate: 100 },
   *       { name: "Deluxe",   qty: 3, maxPeople: 3, rackRate: 150 }
   *     ]
   *   }
   * ]
   */
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
            // include other allowed fields as needed
          }))
        }
      ];
      const res = await client.post('/properties', payload);
      return res.data;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }

  /**
   * Add explicit unit entries to an existing roomType
   * payload example:
   * [
   *   {
   *     id: 12345,
   *     roomTypes: [
   *       {
   *         id: 11,
   *         units: [{ name: 'Std 101' }, { name: 'Std 102' }]
   *       }
   *     ]
   *   }
   * ]
   */
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


  /**
   * Find a roomType by a roomId. This will:
   * - check if any roomType.id === roomId
   * - check if any roomType.roomId === roomId (some responses use roomId)
   * - check units[] inside each roomType and match unit.id === roomId (unit -> parent roomType)
   */
  async findRoomTypeByRoomId(propertyId, roomId) {
    const roomTypes = await this.getRoomTypes(propertyId);
    const rid = Number(roomId);

    // direct match on roomType id or roomId field
    let found = roomTypes.find(rt => Number(rt.id) === rid || Number(rt.roomId) === rid);
    if (found) return found;

    // search units array inside roomTypes (unit id mapping)
    for (const rt of roomTypes) {
      if (!rt.units) continue;
      if (Array.isArray(rt.units) && rt.units.some(u => Number(u.id) === rid || Number(u.unitId) === rid)) {
        return rt; // return parent roomType
      }
    }

    // not found
    return null;
  }

  /**
   * Determine "better" room types relative to currentRoomType.
   * - If rankOverrides (array of names) provided, obey that order (filter out current).
   * - Otherwise compute score primarily from rackRate (higher = better),
   *   tie-break by sellPriority.
   * Returns an array sorted best->worst (excluding current room type).
   */
  getBetterRoomTypesOrdered(currentRoomType, allRoomTypes, rankOverrides = null) {
    const curId = Number(currentRoomType?.id);

    // If explicit rankOverrides provided as names, follow it
    if (Array.isArray(rankOverrides) && rankOverrides.length > 0) {
      const ordering = [];
      for (const name of rankOverrides) {
        const found = allRoomTypes.find(rt => rt.name && rt.name.toLowerCase() === name.toLowerCase());
        if (found && Number(found.id) !== curId) ordering.push(found);
      }
      return ordering;
    }

    // derive score from rackRate (primary) and sellPriority (secondary)
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
