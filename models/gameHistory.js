import mongoose from "mongoose";

const gameHistorySchema = mongoose.Schema({
    gameMode: {
        type: String,
        enum: ['time', 'infinite']
    },
    playTime: {
        type: Number,
    },
    score: {
        type: Number,
    },
    coin: {
        type: Number,
    },
    kills: {
        type: Number
    }
},{
    timestamp: true,
});


const GameHistory = new mongoose.model("GameHistory", gameHistorySchema);


export {GameHistory};