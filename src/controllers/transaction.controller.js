const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const transactionModel = require("../models/transaction.model");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const emailSender = require("../services/email.service");

/**
 * - Create a transaction
 * THE 10 STEP TRANSFER FLOW:
 * 1. Validate Request
 * 2. Validate Idempotency Key
 * 3. Check account status
 * 4. Derive Sender balance from ledger
 * 5. Create transaction(PENDING)
 * 6. Create Credit ledger entry
 * 7. Create Debit ledger entry
 * 8. Mark transaction completed
 * 9. Commit MongoDB session
 * 10. Send notification email
 */

async function createTransaction(req, res) {
  /**
   * 1. Validate Request
   */

  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "fromAccount, toAccount, amount and idempotencyKey are required for a transaction",
    });
  }

  const isFromAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const isToAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!isFromAccount || !isToAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  /**
   * 2. Validate Idempotency Key
   */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "SUCCESSFUL") {
      return res.status(200).json({
        message: "Transaction has completed successfully",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is in processing",
      });
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(200).json({
        message: "Transaction has failed, Try again",
      });
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(200).json({
        message: "Transaction has reversed, Try again",
      });
    }
  }

  /**
   * 3. Check Account Status
   */

  if (isToAccount.status !== "ACTIVE" || isFromAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message: "Both toAccount and fromAccount needs to be active",
    });
  }

  /**
   * 4. Derive sender balance from ledger
   */

  const balance = await isFromAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({   
      message: `Insufficient Balance. Current balance is ${balance} and amount is ${amount}`,
    });
  }

  /**
   * 5. Create Transaction(PENDING)
   */

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel(
      {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING",
      }
  );

  /**
   * 6. Create Debit ledger entry
   */

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  /**
   * 7. Create Credit ledger entry
   */

  const creaditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction.status = "SUCCESSFUL";

  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  emailSender.transactionEmail(req.user.email, amount);
  return res.status(200).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
}

async function createInitialFundTransaction(req, res) {
  const { toAccount, idempotencyKey, amount } = req.body;

  if (!toAccount || !idempotencyKey || !amount) {
    return res.status(400).json({
      message:
        "To Account, idempotencyKey and amount is required to create an transaction",
    });
  }

  const toUserAccount = await accountModel.findById(toAccount);

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid user",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount: toUserAccount._id,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creaditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction.status = "SUCCESSFUL";

  await transaction.save({ session });
  await session.commitTransaction();

  session.endSession();
  return res.status(201).json({
    message: "Initial fund trnasaction completed successfully",
    transaction : transaction
  });
}

module.exports = { createTransaction, createInitialFundTransaction };
