import redisClient from "../config/redis.config.js";

const default_ttl = 300;

export const getCachedData = async (key) => {
    try{
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    }catch(err){
        console.error(`Cache get error for key ${key}: `, err);
        return null;
    }
}

export const setCachedData = async (key, data, ttl = default_ttl) => {
    try{
        await redisClient.setEx(key, ttl, JSON.stringify(data));
    }catch(err){
      console.error(`Cache set error for key ${key}: `, err);
      return null;  
    }
}

