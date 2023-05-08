const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')
const { trusted } = require('mongoose')

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
const updateUser = async (req, res) => {
    const { name, email } = req.body
    console.log(req.body)
    if (!name || !email) {
        throw new CustomApi('Please provide your email or name', StatusCodes.BAD_REQUEST)
    }
    const user = await User.findOneAndUpdate({ _id: req.user.id }, { name, email }, { new: true, runValidators: true, overwrite: true, timestamps: false })
    if (!user) {
        throw new CustomApi(`Try again`, StatusCodes.UNAUTHORIZED)
    }
    const token = await user.createJWT()
    res.cookie('token', token, { httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 3) })
    res.status(StatusCodes.OK).json({ user: { name, email } })
}
const updateUserPassword = async (req, res) => {
    const { confirmPassword, newPassword } = req.body
    if (!confirmPassword || !newPassword) {
        throw new CustomApi('Please provide both old and new passwords', StatusCodes.NOT_FOUND)
    }
    const user = await User.findOne({ _id: req.user.id })
    console.log(confirmPassword)
    const comparePassword = await user.comparePassword(confirmPassword)
    if (!comparePassword) {
        throw new CustomApi('Invalid credentials', StatusCodes.BAD_REQUEST)
    }
    user.password = newPassword
    await user.save()
    res.status(StatusCodes.CREATED).json({ msg: 'Password Succesfully updated' })
}
const showCurrentUser = async (req, res) => {
    console.log(req.user.id)
    const user = await User.findOne({ _id: req.user.id })
    if (!user) {
        throw new CustomApi('No such User exists', StatusCodes.BAD_REQUEST)
    }
    console.log(user)
    const { name, email, role } = user
    res.status(StatusCodes.OK).json({ user: { name, email, role } })
}
module.exports = { getAllUsers, getSingleUser, updateUser, updateUserPassword, showCurrentUser }