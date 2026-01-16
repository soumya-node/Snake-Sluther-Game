import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
    transactionId:{
        type: String,
        required: true,
    },
    paymentAmt: {
        type: String,
        required: true,
    },
    planTitle: {
        type: String,
        enum: ['Gold', 'Silver', 'Bronze'],
    },
    item: {
        type: String,
        enum: ['coin', 'powerup'], 
    },
    Coins: {
        type: Number,
        required: true,
    },
    Status: {
        type: String,
        required: true,
        enum: ['Complete', 'Pending', 'Failed']
    },
},{
    timestamp: true,
});

const Transaction = new mongoose.model('Transaction', transactionSchema);


export {Transaction} 