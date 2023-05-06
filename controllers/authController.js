const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')

const register = async (req, res) => {
    console.log(req.body)
    const { name, email, password } = req.body
    // const emailAlreadlyExists = await User.findOne({ email })
    // if (emailAlreadlyExists) {
    //     throw new CustomApi('Email already exists', StatusCodes.BAD_REQUEST)
    // }
    const user = await User.create({ name, email, password })
    const token = await user.createJWT()
    console.log(token)
    res.cookie('token', token, { httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 3) })
    res.status(StatusCodes.OK).json({ user: { name: user.name, email: user.email }, token })
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
    const match = await user.comparePassword(password)
    if (match) {
        const token = await user.createJWT()
        res.cookie('token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 3)
        })
        return res.status(StatusCodes.OK).json({ msg: "Successfully signed in", token })
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please try again" })
    }

}
const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.redirect(StatusCodes.MOVED_TEMPORARILY, "/api/v1/")
}

module.exports = {
    register, login, logout
}