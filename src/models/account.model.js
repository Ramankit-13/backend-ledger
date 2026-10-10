const mongoose = require('mongoose');
const ledgerModel = require('./ledger.model');

const accountSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : [true, "Account must be associated with a user"],
        index : true
    },

    status : {
        type : String,
        enum : {
            values : ["ACTIVE", "FROZEN", "CLOSED"],
            message : "Status can be either Active, Frozen or Closed",
        },
        default : 'ACTIVE'
    },

    currency : {
        type : String,
        default : "INR",
        required : [true, "Currency is required to create an account"]
    }


}, {timestamps : true})

accountSchema.index({user : 1, status:1})

/**
 * Aggregation Pipeline to calculate the balance
 */

accountSchema.methods.getBalance = async function(){
    const balanceData = await ledgerModel.aggregate([
        {$match : {account : this._id}},
        {
            $group : {
                _id : null,
                totalDebit : {
                    $sum : {
                        $cond : [
                            {$eq : ['$type', 'DEBIT']},
                            '$amount', 
                            0
                        ]  
                    }
                },
                totalCredit : {
                    $sum : {
                        $cond : [
                            {$eq : ['$type', 'CREDIT']},
                            '$amount',
                            0
                        ]                  
                    }
                }
            }
        },
        {
            $project : {
                _id : 0,
                totalBalance : {$subtract : ['$totalCredit', '$totalDebit']}
            }
        }
    ])

    if(balanceData.length === 0){
        return 0
    }

    return balanceData[0].totalBalance
}

const accountModel = mongoose.model('account', accountSchema);

module.exports = accountModel;
