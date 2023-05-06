const jwt = require('jsonwebtoken')
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
    console.log(decoded);
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
module.exports = authenticationMiddleware