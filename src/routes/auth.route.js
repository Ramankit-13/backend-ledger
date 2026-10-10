const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware')


router.post('/register', authController.userRegisterController);

router.post('/login', authController.userLoginController);

router.post('/logout', authMiddleware.authMiddleware, authController.userLogoutController)



module.exports = router;