import express from "express";
import {configDotenv} from "dotenv";
import { connectDB } from "./databaseconnection.js";
import { userroute } from "./routes/user.js";

configDotenv();

connectDB().then(()=>{
    console.log("database connected...");
}).catch((error)=>{
    console.log("Database connection error ", error);
});

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/user", userroute);

app.get('/', (req,res)=>{
    res.status(200).json({
        message: "hello ji!"
    });
});

app.listen(port,()=>{
    console.log('Server Started Listening...');
});