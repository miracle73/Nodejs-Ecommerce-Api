const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide your name'],
        trim: true,
        maxlength: [50, 'name cannot be more than 50 characters'],
        minlength: [5, 'name cannot be less than 5 characters']
    },
    email: {
        type: String,
        required: [true, 'please provide your email'],
        validate: [validator.isEmail, 'Please provide a valid email'],
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'please provide your password'],
        minlength: [6, 'password cannot be less than 6 characters']

    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    verificationToken: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    verified: Date,
    passwordToken: String,
    passwordTokenExpirationDate: Date
})

UserSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword
})
UserSchema.methods.createJWT = async function (token) {
    if (!token) {
        const token = await jwt.sign({ id: this._id, name: this.name, role: this.role }, process.env.TOKEN_SECRET, { expiresIn: '5h' })
        return token
    }
    const addedToken = await jwt.sign({ id: this._id, name: this.name, role: this.role, token }, process.env.TOKEN_SECRET, { expiresIn: '5h' })
    return addedToken
}
UserSchema.methods.comparePassword = async function (password) {
    console.log(password)
    const isMatch = await bcrypt.compare(password, this.password)
    return isMatch
}
module.exports = mongoose.model('User', UserSchema)