import axios from 'axios';
import { BEDS24_KEYS } from '../config/beds24.config.js';

export const client = axios.create({
  baseURL: BEDS24_KEYS.BEDS24_BASE_URL,
  headers: {
     Token : BEDS24_KEYS.BEDS24_TOKEN,
    'Content-Type': 'application/json'
  },
  timeout: 20000
});

export function wrapAxiosError(err) {
  const e = new Error(err.message || 'Beds24 request failed');
  e.status = err.response?.status || 500;
  e.details = err.response?.data || null;
  return e;
}
