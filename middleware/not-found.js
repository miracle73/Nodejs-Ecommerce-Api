const { StatusCodes } = require('http-status-codes')

const notFound = (req, res) => {
    res.status(StatusCodes.NOT_FOUND).send('Page not Found')
}
module.exports = notFound