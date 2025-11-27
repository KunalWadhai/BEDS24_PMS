import mongoose, { mongo } from "mongoose";
import {ENV} from '../config/env.js';

export const connectDB = async () =>{
    try{
        const MONGODB_URI = ENV.MONGODB_URI;
        if(!MONGODB_URI){
            console.log("Mongodb url is not configured");
        }
        const conn = await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected successfully", mongoose.connection.host);
        return true;
    }catch(err){
        console.error("Mongodb connection failed due to error", err.message);
        throw err;
    }
}