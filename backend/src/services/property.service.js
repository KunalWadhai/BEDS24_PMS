import axios from 'axios';
import {BEDS24_KEYS} from '../config/beds24.config.js';


class PropertyService {
  async createProperty(propertyData) {
    try{
        const payload = [{
          name: propertyData.name,
          propertyType: propertyData.propertyType,
          address: propertyData.address,
          city: propertyData.city,
          state: propertyData.state,
          country: propertyData.country,
          postcode: propertyData.postcode,
          mobile: propertyData.mobile,
          currency: propertyData.currency,
        }];

        const response = await axios.post(
          `${BEDS24_KEYS.BEDS24_BASE_URL}/properties`,
          payload,
          {
            headers: {
              'token': BEDS24_KEYS.BEDS24_TOKEN,
              'Content-Type': 'application/json'
            }
          }
        );

        if(!response.data) {
            const error = new Error("No data returned from Beds24 API");
            error.status = 500;
            throw error;
        }

      return response.data;
  }catch(err){
        console.error("Beds24 API Error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });

      const error = new Error(
        err.response?.data?.message || err.message || "Failed to create property"
      );
      error.status = err.response?.status || 500;
      error.details = err.response?.data;
      throw error;
    }
  }
  
  async getProperty(propertyId) {
    try {
      const response = await axios.get(
        `${BEDS24_KEYS.BEDS24_BASE_URL}/properties/${propertyId}`,
        {
          headers: { 'token': BEDS24_KEYS.BEDS24_TOKEN }
        }
      );
      return response.data;
     }catch(err) {
      console.error("Beds24 API Error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });

      const error = new Error(
        err.response?.data?.message || err.message || "Failed to fetch property"
      );
      error.status = err.response?.status || 500;
      throw error;
    }
  }
}

export const propertyService = new PropertyService();
