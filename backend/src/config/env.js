import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
    PORT:process.env.PORT,
    BEDS24_API_KEY:process.env.BEDS24_API_KEY,
    BEDS24_PROP_KEY:process.env.BEDS24_PROP_KEY,
    BEDS24_BASE_URL:process.env.BEDS24_BASE_URL,
}
