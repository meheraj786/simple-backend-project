import dotenv from 'dotenv'
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import { app } from './app.js';

dotenv.config({ path: './' })


;(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
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