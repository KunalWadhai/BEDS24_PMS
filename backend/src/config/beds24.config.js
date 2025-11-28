import dotenv from 'dotenv';
dotenv.config();

export const BEDS24_KEYS = {
    BEDS24_TOKEN:process.env.BEDS24_TOKEN,
    BEDS24_BASE_URL:process.env.BEDS24_BASE_URL,
}