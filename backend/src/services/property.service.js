import { client, wrapAxiosError } from '../utils/httpClient.js';

class PropertyService {
  async createProperty(propertyData) {
    try {
      const payload = [{
        name: propertyData.name,
        propertyType: propertyData.propertyType || 'apartment',
        currency: propertyData.currency || 'INR',
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        country: propertyData.country,
        postcode: propertyData.postcode,
        mobile: propertyData.mobile,
      }];

      const res = await client.post('/properties', payload);
      return res.data;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }

  async getProperty(propertyId) {
    try {
      const res = await client.get(`/properties/${propertyId}?includeAllRooms=true`);
      return res.data;
    } catch (err) {
      throw wrapAxiosError(err);
    }
  }
}

export const propertyService = new PropertyService();
