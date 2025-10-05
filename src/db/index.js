// db/index.js
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        // Debug: এটা দেখুন কি print হয়
        console.log("MONGODB_URI:", process.env.MONGODB_URI);
        console.log("DB_NAME:", DB_NAME);
        console.log("Full connection string:", `${process.env.MONGODB_URI}/${DB_NAME}`);
        
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        console.log(`📁 Database Name: ${connectionInstance.connection.name}`);
        
    } catch (error) {
        console.error("❌ MONGODB connection FAILED ", error);
        throw error;
    }
}

export default connectDB;