const jwt = require('jsonwebtoken')
const User = require('../models/user')
const CustomApi = require('../errors/custom-api')
const { StatusCodes } = require('http-status-codes')
const authenticationMiddleware = async (req, res, next) => {

    // const authHeader = req.headers.authorization
    // if (!authHeader || !authHeader.startsWith('Bearer')) {
    //     throw new CustomApi('Authentication Invalid', StatusCodes.UNAUTHORIZED)
    // }
    // const token = authHeader.split(' ')[1]

    const token = req.cookies.token
    const decoded = jwt.decode(token);
    // console.log(decoded);
    if (!token) {
        throw new CustomApi('Token does not exist', StatusCodes.UNAUTHORIZED)
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        const { id, name } = decoded
        req.user = { id, name }
        next()
    }
    catch (error) {
        res.json({ error })
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