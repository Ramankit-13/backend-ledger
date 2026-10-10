const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailController = require('../services/email.service'); 
const tokenBlacklistModel = require('../models/blacklist.model')

async function userRegisterController(req, res){
    const {email, password, name} = req.body;

    const isEmailAlreadyExists = await userModel.findOne({
        email : email
    })

    if(isEmailAlreadyExists){
        return res.status(422).json({
            message : "Email already exists"
        })
    }


    const user = await userModel.create({
        email,
        password, 
        name
    })

    const token = jwt.sign({
        id : user._id
    }, process.env.JWT_SECRET, {expiresIn:"3d"});

    res.cookie('token', token);

    res.status(201).json({
        message : "user registered successfully",
        user : {
            id : user._id,
            email : user.email,
            name : user.name
        }
    })

    await emailController.registrationEmail(user.email);

}

async function userLoginController(req, res){
    const{email, name, password} = req.body;

    const user = await userModel.findOne({
        $or : [
            {email},
            {name}
        ]
    }).select('+password');

    if(!user){
        return res.status(401).json({
            message : "User Not Found"
        })
    }

    const isValidPassword = await user.compare(password);

    if(!isValidPassword){
        return res.status(401).json({
            message : "wrong password"
        })
    }

    const token = jwt.sign({
        id : user.id
    }, process.env.JWT_SECRET, {expiresIn : "3d"
    })

    res.cookie('token', token);

    res.status(200).json({
        message : "user logged in successfully",
        user : {
            id : user.id,
            email : user.email,
            name : user.name
        }
    })

}

async function userLogoutController(req, res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(400).json({
            message : "User logged out successfully"
        })
    }

    res.cookie('token', "");

    await tokenBlacklistModel.create({
        token : token
    })

    return res.status(400).json({
        message : "User logged out successfully"
    })


}

module.exports = { userRegisterController, userLoginController, userLogoutController };