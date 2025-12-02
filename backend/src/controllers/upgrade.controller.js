import { bookingService } from '../services/booking.service.js';
import { inventoryService } from '../services/inventory.service.js';

// POST /api/properties/:propertyId/check-next-day-upgrades
export const checkNextDayUpgrades = async (req, res) => {
  try {
    const { propertyId } = req.params;
    if (!propertyId) return res.status(400).json({ success: false, error: 'propertyId required' });

    const { date: requestedDate, fallbackOrder } = req.body ?? {};
    const dateToCheck = requestedDate || nextDayISO();

    // Step 1: fetch bookings arriving on dateToCheck
    const bookings = await bookingService.getBookingsForProperty(propertyId, dateToCheck);
    console.log("Bookings :", bookings);
    if (!bookings?.length) return res.json({ success: true, date: dateToCheck, results: [] });

    // Step 2: fetch availability for entire date range (arrival -> last night of longest booking)
    const maxDeparture = bookings.reduce((acc, b) => (b.departure > acc ? b.departure : acc), bookings[0].departure);
    const endDate = lastNightISO(maxDeparture);

    const availResponse = await inventoryService.getRoomsAvailability(propertyId, dateToCheck, endDate);
    const availDataArray = availResponse?.data ?? availResponse;

    // Build maps for roomId -> typeName and typeName -> [roomIds]
    const roomIdToName = new Map();
    const nameToRoomIds = new Map();
    if (Array.isArray(availDataArray)) {
      for (const row of availDataArray) {
        const rid = Number(row.roomId);
        const name = (row.name || 'Unknown').trim();
        roomIdToName.set(rid, name);
        if (!nameToRoomIds.has(name)) nameToRoomIds.set(name, []);
        nameToRoomIds.get(name).push(rid);
      }
    }

    // Ranking of room types (best -> worst)
    const rankingNames = buildRanking(fallbackOrder, nameToRoomIds);

    // Helper to get one-level-up room type name
    function getImmediateHigherName(currentName) {
      const idx = rankingNames.findIndex(n => n.toLowerCase() === String(currentName || '').toLowerCase());
      if (idx <= 0) return null; // top or not found
      return rankingNames[idx - 1];
    }

    const results = [];

    for (const b of bookings) {
      const curRoomId = Number(b.roomId);
      const curRoomName = roomIdToName.get(curRoomId) || b.roomName || 'Unknown';

      const currentRoomObj = { roomId: curRoomId, name: curRoomName };
      const immediateHigherName = getImmediateHigherName(curRoomName);

      let upgrade = null;
      if (immediateHigherName && nameToRoomIds.has(immediateHigherName)) {
        const candidateRoomIds = nameToRoomIds.get(immediateHigherName);

        // Check each candidate room for availability over this booking's nights
        const bookingEndDate = lastNightISO(b.departure);
        for (const candidateRoomId of candidateRoomIds) {
          const isAvailable = inventoryService.isRoomIdAvailableInResponse(availDataArray, candidateRoomId);
          if (isAvailable) {
            upgrade = { roomId: candidateRoomId, name: immediateHigherName };
            break;
          }
        }
      }

      results.push({
        bookingId: b.id,
        candidateName: (b.title ? b.title + '. ' : '') + (b.firstName || '') + ' ' + (b.lastName || ''),
        arrival: b.arrival,
        departure: b.departure,
        currentRoom: currentRoomObj,
        upgradeCandidate: upgrade // null if no upgrade possible
      });
    }

    return res.json({ success: true, date: dateToCheck, results });
  } catch (err) {
    console.error('checkNextDayUpgrades error', err);
    return res.status(err.status || 500).json({ success: false, error: err.message || err });
  }
};

// helper utils
function nextDayISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function lastNightISO(departureDateStr) {
  const d = new Date(departureDateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function buildRanking(fallbackOrder, nameToRoomIds) {
  if (Array.isArray(fallbackOrder) && fallbackOrder.length) {
    const lowered = fallbackOrder.map(s => s.toLowerCase().trim());
    const ordered = [];
    for (const nm of lowered) {
      for (const key of nameToRoomIds.keys()) {
        if (key.toLowerCase() === nm) ordered.push(key);
      }
    }
    for (const key of nameToRoomIds.keys()) {
      if (!ordered.includes(key)) ordered.push(key);
    }
    return ordered;
  }

  const priorityKeywords = ['suite', 'presidential', 'superior', 'deluxe', 'delux', 'premium', 'standard', 'basic', 'economy'];
  const namesPresent = Array.from(nameToRoomIds.keys());
  namesPresent.sort((a, b) => {
    const ia = priorityKeywords.findIndex(k => a.toLowerCase().includes(k));
    const ib = priorityKeywords.findIndex(k => b.toLowerCase().includes(k));
    const scoreA = ia === -1 ? priorityKeywords.length : ia;
    const scoreB = ib === -1 ? priorityKeywords.length : ib;
    if (scoreA !== scoreB) return scoreA - scoreB;
    return a.localeCompare(b);
  });
  return namesPresent;
}
