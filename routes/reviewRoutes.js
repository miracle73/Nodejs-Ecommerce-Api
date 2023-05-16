const express = require('express')
const router = express.Router()
const { authorizePermissions, authenticationMiddleware } = require('../middleware/authentication')
const { getAllReviews, getSingleReview, updateReview, deleteReview, createReview } = require('../controllers/reviewController')


router.route('/').get(getAllReviews).post([authenticationMiddleware], createReview)
router.route('/:id').get(getSingleReview).patch([authenticationMiddleware], updateReview).delete([authenticationMiddleware, authorizePermissions], deleteReview)
module.exports = router