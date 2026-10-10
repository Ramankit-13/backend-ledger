const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

/**
 * - This middleware is for authorizing the normal users
 */

async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.header.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token not found",
    });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access",
    });
  }
}

/**
 * - This middleware is to authorize system user
 */

async function systemUserAuthMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorize access, token not found",
    });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);


    const user = await userModel.findById(decoded.id).select("+systemUser");


    if (!user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, you are not a system user",
      });
    }

    req.user = user;
    return next();
  } 
  catch (err) {
    return res.status(401).json({
      message: "Unauthorize access`",
    });
  }
}

module.exports = { authMiddleware, systemUserAuthMiddleware };
