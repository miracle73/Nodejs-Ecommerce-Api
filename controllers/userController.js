const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')

const getAllUsers = async (req, res) => {
    const users = await User.find({ role: 'user' })

    const alteredUser = users.map((user) => {
        const { name, email } = user
        return { name, email }
    })

    console.log(alteredUser)
    res.status(StatusCodes.OK).json({ users: alteredUser })


}

const getSingleUser = async (req, res) => {
    console.log(req.user.id)
    const user = await User.findOne({ _id: req.user.id }).select('-_id -password -role')
    if (!user) {
        throw new CustomApi(`No user found with such Id ${req.params.id}`, StatusCodes.UNAUTHORIZED)
    }
    res.status(StatusCodes.OK).json({ user })

}
const updateUser = (req, res) => {
    res.send('updateUser', req.params)
}
const updateUserPassword = (req, res) => {
    res.send(req.body)
}
const showCurrentUser = (req, res) => {
    res.send('showCurrentUser')
}
module.exports = { getAllUsers, getSingleUser, updateUser, updateUserPassword, showCurrentUser }