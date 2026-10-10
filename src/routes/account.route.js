const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const accountProvider = require('../controllers/account.controller');

router.post('/', authMiddleware.authMiddleware, accountProvider.createAccountController);

router.get('/', authMiddleware.authMiddleware, accountProvider.getAllAccountController)

router.get('/balance/:accountId', authMiddleware.authMiddleware, accountProvider.getAccountBalanceController)

module.exports = router;