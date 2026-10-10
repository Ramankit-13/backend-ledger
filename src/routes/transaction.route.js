const express = require('express');
const transactionRoutes = express.Router();
const authMiddleware = require('../middleware/auth.middleware')
const transactionController = require('../controllers/transaction.controller');


transactionRoutes.post('/', authMiddleware.authMiddleware, transactionController.createTransaction);

transactionRoutes.post('/system/initial-funds', authMiddleware.systemUserAuthMiddleware, transactionController.createInitialFundTransaction)

module.exports = transactionRoutes;