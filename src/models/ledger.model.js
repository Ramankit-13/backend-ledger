const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'account',
        required : [true, "A transaction is need to be associated with a account"],
        immutable : true,
        index : true
    },

    amount : {
        type : Number,
        required : [true, "Amount is needed for a transaction"],
        immutable : true
    },
    transaction : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'transaction',
        immutable : true,
        required : [true, "A payment needs to be associated with a transaction"],
        index : true
    },

    type : {
        type : String, 
        enum : {
            values : ['CREDIT', 'DEBIT'],
            message : "Transaction type can be either CREDIT or  DEBIT"
        },
        immutable : true,
        required :[true, "A transaction needs to have a type"]
    }
})

function preventLedgerUpdate(){
    throw new Error("Ledger can not be updated")
}

ledgerSchema.pre('findOneAndDelete', preventLedgerUpdate)
ledgerSchema.pre('findOneAndReplace', preventLedgerUpdate)
ledgerSchema.pre('findOneAndUpdate', preventLedgerUpdate)
ledgerSchema.pre('deleteMany', preventLedgerUpdate)
ledgerSchema.pre('deleteOne', preventLedgerUpdate)
ledgerSchema.pre('updateMany', preventLedgerUpdate)
ledgerSchema.pre('updateOne', preventLedgerUpdate)

const ledgerModel = mongoose.model('ledger', ledgerSchema);

module.exports = ledgerModel;



