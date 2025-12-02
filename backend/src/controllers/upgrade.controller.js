import { bookingService } from '../services/booking.service.js';
import { roomService } from '../services/room.service.js';
import { inventoryService } from '../services/inventory.service.js';

// POST /api/properties/:propertyId/check-next-day-arrival-bookings
export const checkNextDayUpgrades = async (req, res) => {
  try {
    const { propertyId } = req.params;
    if (!propertyId) return res.status(400).json({ success: false, error: 'propertyId required' });

    // optional body params
    const { date: requestedDate, fallbackOrder } = req.body ?? {};

    // determine dateToCheck: default to tomorrow
    const dateToCheck = requestedDate || nextDayISO();

    // Step 1: fetch bookings arriving on dateToCheck
    const bookings = await bookingService.getBookingsForProperty(propertyId, dateToCheck);
    console.log("Bookings : ", bookings);

    // if no bookings, return empty quickly
    if (!bookings || bookings.length === 0) {
      return res.json({ success: true, date: dateToCheck, results: [] });
    }

    // Step 2: fetch all roomTypes once
    const allRoomTypes = await roomService.getRoomTypes(propertyId);
    console.log("All Room Types ,", allRoomTypes);
    // Step 3: For all bookings, we will check upgrades.
    // Collect candidate roomIds we will query availability for to reduce calls (optional optimization).
    // But since we need to check per-booking order, we'll call inventory per group of candidate roomIds per property/date range.

    const startDate = dateToCheck; // arrival day is the first night
    // For safe check we should check every night up to last night (day before departure). We'll compute endDate as max of bookings departure-1.
    const maxDeparture = bookings.reduce((acc, b) => {
      const dep = b.departure || b.arrival;
      return dep > acc ? dep : acc;
    }, bookings[0].departure || bookings[0].arrival);

    // we need endDate = lastNight = day before departure for longest booking to ensure availability for full stay
    const endDate = lastNightISO(maxDeparture);

    const results = [];

    // Pre-fetch availability for entire date range once (the API returns all room entries)
    const availResponse = await inventoryService.getRoomsAvailability(propertyId, startDate, endDate);
    console.log("Rooms Availability , ", availResponse);
    // availResponse.data is the array (per your example)
    const availDataArray = availResponse?.data ?? availResponse; // be defensive

    for (const booking of bookings) {
      const b = booking;
      const curRoomId = b.roomId;
      console.log("Current Room ID : ", curRoomId);
      const currentRoom = await roomService.findRoomTypeByRoomId(propertyId, curRoomId);
      console.log("Current Room Type : ", currentRoom);
      // if not found in roomTypes, still proceed with name from bookings
      const currentRoomObj = {
        roomId: curRoomId,
        name: currentRoom?.name || b.roomName || 'Unknown'
      };

      // Build list of better room types ordered
      const betterCandidates = roomService.getBetterRoomTypesOrdered(
        currentRoom ?? { id: curRoomId, name: currentRoomObj.name },
        allRoomTypes,
        fallbackOrder
      );
      console.log("Better Room : ", betterCandidates);

      let upgrade = null;

      // iterate over candidate room types and check availability using previously fetched availDataArray
      for (const candidate of betterCandidates) {
        const candidateRoomId = candidate.id;
        const isAvailable = inventoryService.isRoomIdAvailableInResponse(availDataArray, candidateRoomId);

        if (isAvailable) {
          // found upgradeable room
          upgrade = { roomId: candidateRoomId, name: candidate.name };
          break;
        }
      }

      results.push({
        bookingId: b.id,
        candidateName: (b.title+"."+ " " + b.firstName + " " + b.lastName),
        arrival: b.arrival,
        departure: b.departure,
        currentRoom: currentRoomObj,
        upgradeCandidate: upgrade // null if none
      });
    }

    return res.json({ success: true, date: dateToCheck, results });
  } catch (err) {
    console.error('checkNextDayUpgrades err', err);
    return res.status(err.status || 500).json({ success: false, error: err.message || err });
  }
};

// helper utils
function nextDayISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
// given a departure date (YYYY-MM-DD), return last night (day before)
function lastNightISO(departureDateStr) {
  const d = new Date(departureDateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
