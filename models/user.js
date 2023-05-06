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
    }
})

UserSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword
})
UserSchema.methods.createJWT = async function () {
    const token = await jwt.sign({ id: this._id, name: this.name }, process.env.TOKEN_SECRET, { expiresIn: '1d' })
    return token
}
UserSchema.methods.comparePassword = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password)
    return isMatch
}
module.exports = mongoose.model('User', UserSchema)