const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')
const userChecking = (requestUser, userId) => {
    if (requestUser.id !== userId) {
        throw new CustomApi('You are not the user that did this operation', StatusCodes.BAD_REQUEST)
    }
}
module.exports = userChecking