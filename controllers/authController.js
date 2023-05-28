const User = require('../models/user')
const Token = require('../models/token')
const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')
const crypto = require('crypto')
const sendEmails = require('../middleware/send-email')


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
        res.cookie('accessToken', accessTokenJwt, {
            httpOnly: true,
            maxAge: 1000
        })
        res.cookie('refreshToken', refreshTokenJwt, {
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
        })
        return res.status(StatusCodes.OK).json({ msg: "Successfully signed in" })
    }

    refreshToken = crypto.randomBytes(40).toString('hex')
    const userAgent = req.headers['user-agent']
    const ip = req.ip

    await Token.create({ refreshToken, userAgent, ip, user: user._id })
    const accessTokenJwt = await user.createJWT()
    const refreshTokenJwt = await user.createJWT(refreshToken)
    res.cookie('accessToken', accessTokenJwt, {
        httpOnly: true,
        maxAge: 1000
    })
    res.cookie('refreshToken', refreshTokenJwt, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
    })
    return res.status(StatusCodes.OK).json({ msg: "Successfully signed in" })
}


const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
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





module.exports = {
    register, login, logout, verifyEmail
}