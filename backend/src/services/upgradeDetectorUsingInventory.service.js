// src/services/upgradeDetectorUsingInventory.service.js
import { bookingService } from './booking.service.js'; // you already have this
import { inventoryService } from './inventory.service.js';
import { getImmediateBetterType } from '../utils/roomRank.js';
import { getNightDatesBetween } from '../utils/date.js';
import { wrapAxiosError } from '../utils/httpClient.js';

class UpgradeDetector {
  /**
   * Detect read-only upgrade candidates for bookings with checkIn == targetDate.
   * - propertyId: numeric
   * - targetDate: 'YYYY-MM-DD' (the checkIn date to inspect; typically tomorrow)
   * - rankOverrides: optional object to override ranks per property
   *
   * Returns array of:
   * { bookingId, guestName, assignedType, candidateType, candidateRoomId, availabilityDates: {date: true}, fullAvailability: true }
   */
  async detectForDate(propertyId, targetDate, rankOverrides = {}) {
    try {
      // 1) fetch bookings whose checkIn == targetDate
      const bookings = await bookingService.getBookingsWithCheckin(propertyId, targetDate);
      if (!bookings || bookings.length === 0) return [];

      // 2) determine date window to request availability across all bookings
      // we need startDate = min(checkIn) and endDate = max(checkOut) among bookings
      let minStart = null, maxEnd = null;
      for (const b of bookings) {
        if (!minStart || b.checkIn < minStart) minStart = b.checkIn;
        if (!maxEnd || b.checkOut > maxEnd) maxEnd = b.checkOut;
      }
      // defensive: if any booking missing dates, skip
      if (!minStart || !maxEnd) return [];

      // 3) fetch inventory availability for full window once
      const availList = await inventoryService.getRoomAvailability(propertyId, minStart, maxEnd);
      // availList: array of { roomId, propertyId, name, availability: { 'YYYY-MM-DD': true|false } }

      // Build helper map: name (lower) -> array of room entries
      const nameMap = {};
      for (const entry of availList) {
        const key = (entry.name || '').toLowerCase();
        nameMap[key] = nameMap[key] || [];
        nameMap[key].push(entry);
      }

      // Also gather all unique names on property
      const allNames = Array.from(new Set(availList.map(a => a.name).filter(Boolean)));

      const results = [];

      // 4) For each booking, determine immediate better type then check if any roomId for that type is available for the entire stay
      for (const b of bookings) {
        const assigned = (b.roomTypeName || '').trim();
        if (!assigned) continue;

        const candidateName = getImmediateBetterType(allNames, assigned, rankOverrides);
        if (!candidateName) continue; // nothing above

        const key = candidateName.toLowerCase();
        const candidateRooms = nameMap[key] || [];
        if (!candidateRooms.length) continue;

        // build nights array for this booking: from checkIn (inclusive) to day before checkOut (exclusive)
        const nights = getNightDatesBetween(b.checkIn, b.checkOut);
        if (!nights.length) continue;

        // Find any room entry for candidateName that has availability true for ALL nights
        let found = null;
        for (const room of candidateRooms) {
          const availObj = room.availability || {};
          let ok = true;
          for (const d of nights) {
            // If date missing or false => not available
            if (!Object.prototype.hasOwnProperty.call(availObj, d) || !availObj[d]) {
              ok = false;
              break;
            }
          }
          if (ok) { found = room; break; }
        }

        if (found) {
          results.push({
            bookingId: b.bookingId,
            guestName: b.guestName,
            assignedType: assigned,
            candidateType: candidateName,
            candidateRoomId: found.roomId,
            availability: found.availability,
            nights
          });
        }
      }

      return results;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }
}

export const upgradeDetector = new UpgradeDetector();
