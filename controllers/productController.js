const Product = require('../models/product')
const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')
const cloudinary = require('cloudinary').v2
const fs = require('fs')


const createProduct = async (req, res) => {
    req.body.user = req.user.id
    const product = await Product.create(req.body)
    res.status(StatusCodes.OK).json({ product })
}

const getAllProducts = async (req, res) => {
    const products = await Product.find({}).populate('reviews')
    res.status(StatusCodes.OK).json({ products, count: products.length })


}

const getSingleProduct = async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id }).populate('reviews')
    if (!product) {
        throw new CustomApi('No product exists with such Id', StatusCodes.NOT_FOUND)
    }
    res.status(StatusCodes.OK).json({ product })

}
const updateProduct = async (req, res) => {
    const product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true, overwrite: true, timestamps: false })
    if (!product) {
        throw new CustomApi(`No product exist with this id ${req.params.id}`, StatusCodes.BAD_REQUEST)
    }
    res.status(StatusCodes.OK).json({ product })
}
const deleteProduct = async (req, res) => {
    const product = await Product.findOneAndDelete({ _id: req.params.id })
    if (!product) {
        throw new CustomApi(`No product exists with such Id ${req.params.id}`, StatusCodes.NOT_FOUND)
    }
    res.status(StatusCodes.OK).json({ msg: "Product Successfully deleted" })
}

const uploadImage = async (req, res) => {
    if (!req.files) {
        throw new CustomApi("No such File Exist", StatusCodes.NOT_FOUND)
    }
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, { use_filename: true, folder: 'Third Folder' })

    const pictureFormats = ['png', 'jpg']
    for (i = 0; i < pictureFormats.length; i++) {
        if (result.format === pictureFormats[i]) {
            console.log(result)
            fs.unlinkSync(req.files.image.tempFilePath)
            res.status(StatusCodes.OK).json({ image: { src: result.secure_url } })
        }
        throw new CustomApi('Please upload an Image file', StatusCodes.BAD_REQUEST)
    }

}
module.exports = { getAllProducts, getSingleProduct, updateProduct, deleteProduct, createProduct, uploadImage }