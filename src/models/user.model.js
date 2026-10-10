const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email : {
        type : String, 
        required : [true, "Email is requried to create an account"],
        unique : [true, "Email already exists"],
        trim : true,
        lowercase : true,
        match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid Email'],
    },
    name : {
        type : String,
        required : [true, "Name is requried to create an account"]

    },
    password : {
        type : String,
        required : [true, 'Password is requried to create an account'],
        select : false,
        minlength : [6, "Password must be atleast 6 characters"]
    },
    systemUser : {
        type : Boolean,
        default : false,
        immutable : true,
        select : false
    }
}, {
    timestamps : true
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next;
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next;
})

userSchema.methods.compare = async function(password){
    return bcrypt.compare(password, this.password);
}

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
