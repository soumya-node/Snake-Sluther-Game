import express from "express";
import { User } from "../models/user.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GameHistory } from "../models/gameHistory.js";
import { PurchasedItem } from "../models/purchaseitem.js";
import { Transaction } from "../models/transaction.js";
import client from "../redisconnection.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmailOtp from "../nodemailersetting.js";
// import { adminAuthorization } from "../utils/adminAuthorization.js";


configDotenv();

const secret = process.env.SECRET;
const salt = process.env.SALT;

const userroute = express.Router({mergeParams: true});

userroute.get('/usertype/:type', /*adminAuthorization,*/ async (req,res)=>{
    const userType = req.params.type; // this can be all | active | inactive
    let users = null;
    if(userType == "all"){
        users = await User.find({}).select('_id username accountType loginDetail coinBalance');
    }else if(['active','inactive'].includes(userType)){
        users = await User.find({userType: userType}).select('_id username accountType loginDetail coinBalance');
    }else{
        return res.status(400).json({message: "This specific type of users are not here!"});
    }
    return res.status(200).json(users);
});

userroute.patch('/:id/block/:status', /*adminAuthorization,*/ async (req,res)=>{
    const status = req.params.status == 'true' ? true : false // this can be either true or false;
    const userId = req.params.id;
    let result = null;
    if(['true', 'false'].includes(req.params.status)){
        result = await User.updateOne({_id : userId}, {blocked: status});
        res.status(200).json(result);
    }else{
        res.status(400).json({message: "This is a wrong updation value"});
    }
});

userroute.get('/oneuser/:id/:infotype/:filtertype', /*adminAuthorization,*/ async (req,res)=>{
    const userId = req.params.id;
    const infotype = req.params.infotype ? req.params.infotype : 'gameHistory'; // this can be : gameHistory | transactions | purchasedItems ;
    const filtertype = req.params.filtertype ? req.params.filtertype : 'all' ;
    let result = null;
    if(!['gameHistory', 'transactions', 'purchasedItems'].includes(infotype)){
        res.status(400).json({message: 'Wrong input data'});
    }
    let infoAndFilterRelation = {
        gameHistory: "gameMode",
        transactions: "item",
        purchasedItems: "itemType"
    }
    let optionObject = {
        gameMode: ['all', 'infinite', 'time'],
        item: ['all', 'coin', 'powerup'],
        itemType: [ 'all', 'snake', 'background', 'powerup']
    }
    if( ! optionObject[infoAndFilterRelation[infotype]].includes(filtertype) ){
        res.status(400).json({
            message: 'the filter option is not valid!',
        });
    }
    if(filtertype == 'all'){
        result = await User.find({_id: userId}).select('_id age username mobilenumber email country lastActive createdAt '+ infotype).populate(infotype);
        res.status(200).send(result);
    }else{
        result = await User.find({_id: userId}).select('_id age username mobilenumber email country lastActive createdAt '+ infotype).populate({path: infotype, match: {[infoAndFilterRelation[infotype]]: filtertype}});
        res.status(200).send(result);
    }
});


userroute.post('/emailOtp', async (req,res)=>{
    let userEmail = req.body.email;
    let emailOtp = generateOTP();

    sendEmailOtp(userEmail, emailOtp);
    
    await client.set(`email:otp:${userEmail}`, emailOtp, {EX: 600});

    res.status(200).json({
        message: "The otp has been send to your email",
    });
});


userroute.post('/phoneOtp', async (req,res)=>{
    let userPhone = req.body.phone;
    let phoneOtp = generateOTP();
    await client.set(`email:otp:${userPhone}`, phoneOtp, {EX: 300});

    // send message here

    res.status(200).json({
        message: "The otp has been send to your email",
    });
});

userroute.post('/signup' , async (req,res)=>{
    let {username, accountType, loginDetail, age, mobilenumber, email, country, password, phoneOtp/*, emailOtp*/} = req.body;

    let storedOtp = await client.get(`email:otp:${email}`);
    let hashedOtp = await bcrypt.hash(emailOtp, parseInt(process.env.SALT));

    if(storedOtp != hashedOtp){
        client.del(`email:otp:${email}`);
        return res.status(400).json({
            message: "Invalid mail OTP, try to resend Otp",
        });
    }
    
    let existingUser = await User.findOne({$or : [{email: email}, {mobilenumber: mobilenumber}]});
    if(existingUser){
        res.status(400).json({message: "Email or Mobile number already in use"});
    }
    let hashedpassword = bcrypt.hash(password, salt);
    let newUser = User({
        username,
        accountType,
        loginDetail,
        age,
        mobilenumber,
        email,
        country,
        hashedpassword,
    });
    await newUser.save().then((result)=>{
        let token = jwt.sign({
            _id: result._id,
        },secret,{expiresIn: '12h'});
        res.status(200).json({
            message: "Sign up successful",
            token: token,
        });
    }).catch((error)=>{
        console.log('error in creating new user', error);
        res.status(500).json({
            message: "Somthing wrong, try later",
        });
    });
});


userroute.post('/signin', async (req,res)=>{
    let {email, password} = req.body;
    let existingUser = await User.findOne({email: email});
    if(! existingUser){
        res.status(400).json({
            message: "hello, you havn't done sign up, are you crazy",
        });
    }
    try{
        let passwordVarification = await bcrypt.compare(password, existingUser.password);
        if(passwordVarification){
            let token = jwt.sign({
                _id: existingUser._id,
            }, secret, {expiresIn: "12h"});
            res.status(200).json({
                message: "Log in successful, hip hip hurrey!!!!",
                token: token
            });
        }else{
            res.status(400).json({
                message: "Dude have you really forgotten your password, that's bad!"
            });
        }
    }catch(error){
        console.log('some error in password matching', error)
        res.status(400).json({
            message: "Sorry budy there is some issue right now, please comeback later!",
            error: error
        });
    }
});


export {userroute};