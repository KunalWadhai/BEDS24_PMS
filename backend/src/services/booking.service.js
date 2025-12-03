import { client, wrapAxiosError } from '../utils/httpClient.js';

class BookingService {
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
