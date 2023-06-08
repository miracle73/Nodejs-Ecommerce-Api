const User = require('../models/user')
const Token = require('../models/token')
const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const sendEmails = require('../middleware/send-email')
const cookieResponse = require('../middleware/cookie')


const register = async (req, res) => {
    const { name, email, password } = req.body
    // const emailAlreadlyExists = await User.findOne({ email })
    // if (emailAlreadlyExists) {
    //     throw new CustomApi('Email already exists', StatusCodes.BAD_REQUEST)
    // }
    const verificationToken = crypto.randomBytes(40).toString('hex')
    const user = await User.create({ name, email, password, verificationToken })
    const url = `localhost:3000/user/verify-email?email=${user.email}&token=${verificationToken}`
    const senderDetails = {
        email: user.email,
        subject: `Email Confirmation`,
        message: `<p>Hi ${user.name}</p> 
        <p>please confirm your email by clicking on the following link ${url} </p>`

    }

    await sendEmails(senderDetails);
    res.status(StatusCodes.OK).json({ msg: "Success, check your mail to verify your account", verificationToken })
    console.log(user.verified)
}
const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new CustomApi('Please provide your email or password', StatusCodes.NOT_FOUND)
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new CustomApi('Invalid Credentials', StatusCodes.UNAUTHORIZED)
    }
    console.log(user.isVerified)
    if (!user.isVerified) {
        throw new CustomApi('Kindly verify your email first', StatusCodes.NOT_FOUND)
    }


    const match = await user.comparePassword(password)
    console.log(match)
    if (!match) {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please try again" })
    }
    let refreshToken = ''

    const token = await Token.findOne({ user: user._id })

    if (token) {
        refreshToken = token.refreshToken
        const accessTokenJwt = await user.createJWT()
        const refreshTokenJwt = await user.createJWT(refreshToken)
        await cookieResponse(res, accessTokenJwt, refreshTokenJwt)
        return res.status(StatusCodes.OK).json({ msg: "Successfully signed in" })
    }

    refreshToken = crypto.randomBytes(40).toString('hex')
    const userAgent = req.headers['user-agent']
    const ip = req.ip

    await Token.create({ refreshToken, userAgent, ip, user: user._id })
    const accessTokenJwt = await user.createJWT()
    const refreshTokenJwt = await user.createJWT(refreshToken)
    await cookieResponse(res, accessTokenJwt, refreshTokenJwt)
    return res.status(StatusCodes.OK).json({ msg: "Successfully signed in" })
}


const logout = async (req, res) => {
    const decoded = jwt.verify(req.cookies.refreshToken, process.env.TOKEN_SECRET)
    const token = await Token.findOneAndDelete({ user: req.user.id, refreshToken: decoded.token })
    res.cookie('accessToken', '', {
        httpOnly: true,
        expires: new Date(0)
    })
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0)
    })

    res.redirect(StatusCodes.MOVED_TEMPORARILY, "/api/v1/")
}

const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
        throw new CustomApi('Verification failed 1', StatusCodes.UNAUTHORIZED)
    }
    if (user.verificationToken !== verificationToken) {
        console.log(token)
        console.log(user.verificationToken)
        throw new CustomApi('Verification failed 2', StatusCodes.UNAUTHORIZED)
    }
    const updatedTerms = {
        isVerified: true,
        verified: Date.now(),
        verificationToken: " "
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updatedTerms)

    res.status(StatusCodes.OK).json({ msg: "Email verified" })

}

const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
        const passwordToken = crypto.randomBytes(70).toString('hex')
        const passwordTokenExpirationDate = new Date(Date.now() + 1000 * 60 * 15)
        const hashedPasswordToken = crypto.createHash('sha256').update(passwordToken).digest('hex')
        await User.findOneAndUpdate(user._id, { passwordToken, passwordTokenExpirationDate })
        const url = `localhost:3000/user/reset-password?email=${user.email}&token=${passwordToken}`
        const senderDetails = {
            email: user.email,
            subject: `Reset your password`,
            message: `<p>Hi ${user.name}</p> 
        <p>please confirm your email by clicking on the following link ${url} </p>`

        }

        await sendEmails(senderDetails);
    }



    res.status(StatusCodes.OK).json({ msg: 'Please check your email for the link to reset your password' })
}

const resetPassword = async (req, res) => {
    const { token, email, password } = req.body
    if (!token || !email || !password) {
        throw new CustomApi('Bad Request', StatusCodes.NOT_FOUND)
    }
    const user = await User.findOne({ email })
    if (user) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        if (user.passwordToken == token && user.passwordTokenExpirationDate > new Date(Date.now()))
            await User.findOneAndUpdate({ email: user.email }, { password, passwordToken: null, passwordTokenExpirationDate: null })
    }
    res.status(StatusCodes.OK).json({ msg: 'Your password has been reset successfully' })

}



module.exports = {
    register, login, logout, verifyEmail, forgotPassword, resetPassword
}