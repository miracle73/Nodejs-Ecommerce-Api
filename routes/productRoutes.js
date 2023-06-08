const express = require('express')
const router = express.Router()
const { getAllProducts, getSingleProduct, updateProduct, deleteProduct, createProduct, uploadImage } = require('../controllers/productController')
const { authorizePermissions, authenticationMiddleware } = require('../middleware/authentication')

router.route('/uploadImage').post(authenticationMiddleware, uploadImage)
router.route('/').get(getAllProducts).post(authenticationMiddleware, createProduct)
router.route('/:id').get(getSingleProduct).patch([authenticationMiddleware], updateProduct).delete([authenticationMiddleware], deleteProduct)
module.exports = router