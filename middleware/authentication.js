const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Token = require('../models/token')
const CustomApi = require('../errors/custom-api')
const cookieResponse = require('./cookie')
const { StatusCodes } = require('http-status-codes')
const authenticationMiddleware = async (req, res, next) => {

    // const authHeader = req.headers.authorization
    // if (!authHeader || !authHeader.startsWith('Bearer')) {
    //     throw new CustomApi('Authentication Invalid', StatusCodes.UNAUTHORIZED)
    // }
    // const token = authHeader.split(' ')[1]







    try {
        const { accessToken, refreshToken } = req.cookies
        if (accessToken) {
            const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET)
            const { id, name, role } = decoded
            req.user = { id, name, role }
            return next()
        }
        const decoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET)
        const existingToken = await Token.findOne({ user: decoded.id, refreshToken: decoded.token })
        if (!existingToken) {
            throw new CustomApi('Token does not exist', StatusCodes.UNAUTHORIZED)
        }
        const user = await User.findOne({ _id: decoded.id })
        const accessTokenJwt = await user.createJWT()
        const refreshTokenJwt = await user.createJWT(decoded.token)
        await cookieResponse(res, accessTokenJwt, refreshTokenJwt)
        const { id, name, role, decodedRefreshToken } = decoded
        req.user = { id, name, role, decodedRefreshToken }
        next()



    }
    catch (error) {
        throw new CustomApi('Token is not here', StatusCodes.UNAUTHORIZED)
    }
}
const authorizePermissions = async (req, res, next) => {
    console.log(req.user)
    const user = await User.findOne({ _id: req.user.id })
    if (user.role !== 'admin') {
        throw new CustomApi('You cannot perform this operation', StatusCodes.BAD_REQUEST)
    }
    next();
}
module.exports = { authenticationMiddleware, authorizePermissions }