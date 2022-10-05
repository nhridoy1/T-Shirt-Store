const router = require('express').Router()
const { isLoggedIn, customRole } = require('../middlewares/user')

const {
    createOrder,
    getOneOrder,
    allOrderForLoggedInUser,
    allOrders,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController')


router.route('/order/create').post(isLoggedIn, createOrder)
router.route('/order/myorder').get(isLoggedIn, allOrderForLoggedInUser)
router.route('/order/:orderId').get(isLoggedIn, getOneOrder)

// admin routes
router.route('/admin/orders').get(isLoggedIn, customRole('admin'), allOrders)
router.route('/admin/order/:orderId')
    .put(isLoggedIn, customRole('admin'), updateOrder)
    .delete(isLoggedIn, customRole('admin'), deleteOrder)

module.exports = router