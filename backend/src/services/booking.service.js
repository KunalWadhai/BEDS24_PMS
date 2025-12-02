import { client, wrapAxiosError } from '../utils/httpClient.js';

class BookingService {
  // Fetch bookings for a property, optionally filter by arrival date
  // Uses Beds24 GET /bookings?propertyId=...&arrival=YYYY-MM-DD if available,
  // but we also filter client-side to be safe.
  async getBookingsForProperty(propertyId, arrivalDate = null) {
    try {
      const params = new URLSearchParams({ propertyId: String(propertyId) });
      if (arrivalDate) params.set('arrival', arrivalDate);

      const res = await client.get(`/bookings?${params.toString()}`);
      const data = res.data?.data ?? [];

      if (!arrivalDate) return data;
      // ensure we filter by exact arrival date (format YYYY-MM-DD)
      return data.filter(b => b.arrival === arrivalDate);
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }
}

export const bookingService = new BookingService();
