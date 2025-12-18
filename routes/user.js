import express from "express";
import { User } from "../models/user.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { adminAuthorization } from "../utils/adminAuthorization.js";

configDotenv();

const secret = process.env.SECRET;
const salt = process.env.SALT;

const userroute = express.Router({mergeParams: true});

userroute.get('/userType/:type', /*adminAuthorization,*/ async (req,res)=>{
    const userType = req.params.userType; // this can be All | Active | Inactive
    let users = null;
    if(userType == "All"){
        users = await User.find({}).select('_id username accountType loginDetail coinBalance');
    }else if(['Active','Inactive'].includes(userType)){
        users = await User.find({userType: userType}).select('_id username accountType loginDetail coinBalance');
    }else{
        res.status(400).json({message: "This specific type of users are not here!"});
    }
    res.status(200).json(users);
});

userroute.patch('/block/:status', /*adminAuthorization,*/ async (req,res)=>{
    const status = req.params.status; // this can be either Block or Unblock;
    const userId = req.body._id;
    let result = null;
    if(['Block', 'Unblock'].includes(status)){
        result = await User.updateOne({_id : userId}, {blocked: status});
        res.status(200).json(result);
    }else{
        res.status(400).json({message: "This is a wrong updation value"});
    }
});

userroute.get('/oneuser/:id/:infotype/:filtertype', /*adminAuthorization,*/ async (req,res)=>{
    const userId = req.params.id;
    const infotype = req.params.infotype ? req.params.infotype : 'gameHistory'; // this can be : gameHistory | transactions | purchasedItems ;
    const filtertype = req.params.filtertype ? req.params.filtertype : 'All' ;
    let result = null;
    if(!['gameHistory', 'transactions', 'purchasedItems'].includes(infotype)){
        res.status(400).json({message: 'Wrong input data'});
    }
    let infoAndFilterRelation = {
        gameHistory: "gamemode",

    }
    result = await User.find({_id: userId}).select('_id age username mobilenumber email country lastActive createdAt '+ infotype).populate({path: infotype, match: {}});

});


userroute.post('/signup' , async (req,res)=>{
    let {username, accountType, loginDetail, age, mobilenumber, email, country, password, phoneOtp, emailOtp} = req.body;

    // redis otp cheking implimentation ----------------------------------------------------------------------------------------------
    
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
    })
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