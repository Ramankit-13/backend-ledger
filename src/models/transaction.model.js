const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'account',
        required : [true, "A from account is required to initiate a transaction"]
    },

    toAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'account',
        required : [true, "A from account is required to initiate a transaction"]
    },

    amount : {
        type : Number,
        required : [true, "Amount is needed to initiate a transaction"],
        min : [0.01, "Amount can not be negative"]
    },

    status : {
        type : String,
        enum : {
            values : ['PENDING', 'SUCCESSFUL', 'FAILED', 'REVERSED'],
            message : "Status can only be PENDING, SUCCESSFUL, FAILED  and REVERSED"
        },
        default : "PENDING"
    },

    idempotencyKey : {
        type : String,
        required : [true, "A idempotent key is required to initiate a transaction"],
        unique : [true, "Idempotent Key should be unique"],
        index : true
    }
}, {
    timestamps : true
})

const transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;