import mongoose from "mongoose";

const purchasedItems = mongoose.Schema({
    item: {
        type: String,
    },
    itemType: {
        type: String,
        enum: ['snake', 'background', 'powerup']
    },
    themeType: {
        type: String,
        enum: ['basic', 'patterns', 'Animal'],
    },
    Titlename: {
        type: String,
        enum: ['bronze', 'gold', 'silver']
    },
    claimedBy: {
        type: String,
        enum: ['coin', 'spin', 'chest']
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }
});


const PurchasedItem = new mongoose.model('PurchasedItem', purchasedItems);

export {PurchasedItem};