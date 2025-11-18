const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true

    },
    mobile: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    addharNumber: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isvoted: {
        type: Boolean,
        default: false
    }

});

userSchema.pre('save', async function (next) {

    //hash password genration 
    const user = this // this lines makes sure , middle work before every record is stored 
    //hash the password only if it has been modified or is  new
    if (!user.isModified('password')) return next();
    try {
        //salt generation
        const salt = await bcrypt.genSalt(10);
        //hash password  , same hashed password will be used for comparing password  while authentiocation
        const hashpassword = await bcrypt.hash(user.password, salt);
        //override the password
        user.password = hashpassword;
        next();

    } catch (error) {
        return next(error);

    }

});


userSchema.methods.comparePassword = async function (candidatepassword) {
    try {
        const isMatch = await bcrypt.compare(candidatepassword, this.password);
        // compare function auto extract the salt from the stored hashedPassword and uses it to hash the entered password . it then compares the resulting hasg with store hash , if they match , it indicates that the entered password is correct .
        return isMatch;

    } catch (error) {
        throw error;
    }
}
//create Pers
const User = mongoose.model('User', userSchema);
module.exports = User;