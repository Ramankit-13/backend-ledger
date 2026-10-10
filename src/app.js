require('dotenv').config();
const express = require('express');
const app = express ();
const cookieParser = require('cookie-parser')

app.use(cookieParser())

app.use(express.json());


/**
 * routes required
 */

const authRouter = require('./routes/auth.route');
const accountRouter = require('./routes/account.route');
const transactionRouter = require('./routes/transaction.route');

/**
 * routes used
 */

app.use('/api/auth', authRouter);
app.use('/api/account', accountRouter);
app.use('/api/transaction', transactionRouter);

module.exports = app;