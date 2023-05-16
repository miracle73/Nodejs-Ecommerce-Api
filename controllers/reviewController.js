const Review = require('../models/review')
const Product = require('../models/product')
const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')
const userChecking = require('../middleware/function')


const createReview = async (req, res) => {
    const { product: productId } = req.body

    const product = await Product.findOne({ _id: productId })
    if (!product) {
        throw new CustomApi("Product does not exist", StatusCodes.NOT_FOUND)
    }
    const alreadyReviewed = await Review.findOne({
        product: productId,
        user: req.user.id
    })
    if (alreadyReviewed) {
        throw new CustomApi("You have already reviewed this product", StatusCodes.BAD_REQUEST)
    }
    req.body.user = req.user.id
    const review = await Review.create(req.body)
    res.status(StatusCodes.OK).json({ review })
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({})
    res.status(StatusCodes.OK).json({ reviews, reviews_count: reviews.length })
}

const getSingleReview = async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id })
    if (!review) {
        throw new CustomApi(`No review was found with such id ${req.params.id}`, StatusCodes.NOT_FOUND)
    }
    res.status(StatusCodes.OK).json({ review })

}
const updateReview = async (req, res) => {
    const review = await Review.findOne({ _id: req.params.id })
    if (!review) {
        throw new CustomApi(`No product exist with this id ${req.params.id}`, StatusCodes.BAD_REQUEST)
    }
    userChecking(req.user, review.user)
    review.comment = req.body.comment
    await review.save()
    res.status(StatusCodes.OK).json({ review })
}
const deleteReview = async (req, res) => {

    const review = await Review.findOneAndDelete({ _id: req.params.id })
    if (!review) {
        throw new CustomApi(`No review exists with such Id ${req.params.id}`, StatusCodes.NOT_FOUND)
    }

    res.status(StatusCodes.OK).json({ msg: "Review Successfully deleted" })
}


module.exports = { getAllReviews, getSingleReview, updateReview, deleteReview, createReview }