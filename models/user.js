import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    accountType: {
        type: String,
        enum: ['Bank', 'UPI']
    },
    loginDetail: {
        type: String,
        enum: ['Mobile', 'Google', 'Guest']
    },
    coinBalance: {
        type: Number,
    },
    blocked: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    userType: {
        type: "String",
        enum: ['active', 'inactive']
    },
    username: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    mobilenumber: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        required: true
    },
    gameHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "GameHistory"
      }],
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction"
      }],
    purchasedItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchasedItem"
      }],
},{
    timestamp: true,
});


const User = new mongoose.model('User', userSchema);


export {User};