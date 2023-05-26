const Order = require('../models/order')
const Product = require('../models/product')
const { StatusCodes } = require('http-status-codes')
const CustomApi = require('../errors/custom-api')



const createOrder = async (req, res) => {
    const { cartItems, tax, shippingFee } = req.body
    if (!cartItems || cartItems < 1) {
        throw new CustomApi('No cart items provided', StatusCodes.BAD_REQUEST)
    }
    if (!tax || !shippingFee) {
        throw new CustomApi('Please provide tax and shipping Fee', StatusCodes.NOT_FOUND)
    }
    for (var i = 0; i < cartItems.length; i++) {
        const productID = await Product.findOne({ _id: cartItems[0].product }).select('name price')
        if (!productID) {
            throw new CustomApi(`No product exists with such id ${cartItems[0].product}`, StatusCodes.NOT_FOUND)
        }
    }
    res.status(StatusCodes.OK).send('create Order')
}

const getAllOrders = async (req, res) => {
    res.send('getAllOrders')
}

const getSingleOrder = async (req, res) => {
    res.send('getSingleOrder')

}
const updateOrder = async (req, res) => {
    res.send('updateOrder')
}
const deleteOrder = async (req, res) => {
    res.send('deleteOrder')
}
const getCurrentUserOrders = async (req, res) => {
    res.send('getCurrentUserOrders')
}


module.exports = { getAllOrders, getSingleOrder, updateOrder, deleteOrder, createOrder, getCurrentUserOrders }