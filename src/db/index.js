import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        
        mongoose.connection.on('error', (err) => {
            console.error('Database connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
    } catch (error) {
        console.error("MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

export default connectDB;