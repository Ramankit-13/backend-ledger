const accountModel = require('../models/account.model');

/**
 * - Used to create a account 
 */

async function createAccountController(req, res){
    const user = req.user;
    const {status, currency} = req.body

    const account = await accountModel.create({ 
        user: user._id,
        status: status,
        currency: currency
    })

    res.status(201).json({
        message: "Account created successfully",
        account
    })
}

async function getAllAccountController(req, res){
    const accounts = await accountModel.findOne({user : req.user._id})
    res.status(200).json({
        accounts
    })
}

async function getAccountBalanceController(req, res){
    const {accountId} = req.params;

    const account = await accountModel.findOne({
        _id : accountId,
        user : req.user._id
    })

    if(!account){
        return res.status(400).json({
            message : "account not found"
        })
    }
    const balance = await account.getBalance();

    return res.status(200).json({
        balance : balance
    })
}

module.exports = { createAccountController, getAllAccountController, getAccountBalanceController }