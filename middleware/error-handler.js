const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')

const errorHandler = (err, req, res, next) => {
    if (err instanceof CustomApi) {
        return res.status(err.statusCode).json({ msg: err.message })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
}
module.exports = errorHandler