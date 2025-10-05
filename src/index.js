import dotenv from 'dotenv'
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import { app } from './app.js';
import connectDB from './db/index.js';

dotenv.config({ path: './.env' })


;(async () => {
  try {
    connectDB()
    console.log('Connected to MongoDB successfully');
    
    const server = app.listen(process.env.PORT || 3000, () => {
        console.log(`App is running on port ${process.env.PORT || 3000}`);
    });
    
    server.on('error', (err) => {
        console.log(`Server error: ${err}`);
    });
    
  } catch (error) {
    console.error("Error DB: ", error);
    process.exit(1);
  }
})();