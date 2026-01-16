import jwt from "jsonwebtoken";
import { configDotenv } from 'dotenv';
import {Admin} from "./models/admin.js";

configDotenv();

const secret = process.env.SECRET;

const adminAuthorization = async (req,res,next)=>{
    let token = req.headers.authorization?.split(' ')[1];
    if(!token){
        res.status(400).json({message: "Sorry, You don't have the permmitions to access this item!"});
    }else{
        try{
            let tockenData = jwt.verify(token, secret);
            next();
        }catch(error){
            console.log(error);
            res.status(400).json({message: "Sorry, your session has been expired, login again to access the files"});
        }
    }
}

export {adminAuthorization};