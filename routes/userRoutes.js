const express = require('express')
const router = express.Router()
const { getAllUsers, getSingleUser, updateUser, updateUserPassword, showCurrentUser } = require('../controllers/userController')


router.route('/').get(getAllUsers)
router.route('/show-me').get(showCurrentUser)
router.route('/update-password').patch(updateUserPassword)
router.route('/profile').get(getSingleUser).patch(updateUser)
module.exports = router