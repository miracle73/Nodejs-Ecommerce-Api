const express = require('express')
const router = express.Router()
const { getAllUsers, getSingleUser, updateUser, updateUserPassword, showCurrentUser } = require('../controllers/userController')
const { authorizePermissions } = require('../middleware/authentication')

router.route('/').get(getAllUsers)
router.route('/showMe').get(showCurrentUser)
router.route('/update-password').patch(updateUserPassword)
router.route('/:id').get(getSingleUser).patch(updateUser)
module.exports = router