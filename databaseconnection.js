import mongoose from "mongoose";
import {configDotenv} from "dotenv";

configDotenv();

let mongodbURL = process.env.MONGO_URL;

async function connectDB(){
    await mongoose.connect(mongodbURL);
}

export {connectDB}