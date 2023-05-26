const express = require('express')
const router = express.Router()
const { authorizePermissions } = require('../middleware/authentication')
const { getAllOrders, getSingleOrder, getCurrentUserOrders, updateOrder, deleteOrder, createOrder } = require('../controllers/orderController')
router.route('/showAllMyOrders').get(getCurrentUserOrders)
router.route('/').get(getAllOrders).post(createOrder)
router.route('/:id').get(getSingleOrder).patch(updateOrder).delete(deleteOrder)

module.exports = router