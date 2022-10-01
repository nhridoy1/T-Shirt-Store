const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [40, 'Name should be under 40 characters'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide a email'],
        validator: [validator.isEmail, 'Please enter email in correct format'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Please provide at least 8 characters'],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
       id: {
        type: String,
       },
       secure_url: {
        type: String,
       }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createAt: {
        type: Date,
        default: Date.now
    }
})

// encrypt password before save -- hooks
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
})

// validate the password with passed on user password
userSchema.methods.isPasswordValid = async function(usersendPassword) {
   return await bcrypt.compare(usersendPassword, this.password)
}

// create and return jwt token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY})
}

// generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function() {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString('hex')

    // getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex')

    // expiry of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

    return forgotToken
}

module.exports = mongoose.model('User', userSchema)