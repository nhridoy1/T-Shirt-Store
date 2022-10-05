const Order = require('../models/order')
const Product = require('../models/product')
const {BigPromise} = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')


exports.createOrder = BigPromise(async (req, res, next) => {
    const { 
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount
     } = req.body

     const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
     })

     res.status(201).json({ success: true, order })
})

exports.getOneOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.orderId).populate('user')

    if (!order) {
        return res.status(400).json({ success: false, msg: "Please check order id" })
    }

     res.status(200).json({ success: true, order })
})

exports.allOrderForLoggedInUser = BigPromise(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })

    if (!orders) {
        return res.status(400).json({ success: false, msg: "You have't made any order" })
    }

    res.status(200).json({ success: true, orders })
})

// admin controllers
exports.allOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find()

    if (!orders) {
        return res.status(400).json({ success: false, msg: "Users have't made any orders so far" })
    }

    res.status(200).json({ success: true, orders })
})

exports.updateOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.orderId)

    if (order.orderStatus === 'delivered') {
        return res.status(401).json({ msg: 'Order is already marked for deliver'})
    }

    order.orderStatus = req.body.orderStatus

    order.orderItems.forEach(async product => {
        await updateProductStock(product.product, product.quantity)
    })

    await order.save({ validateBeforeSave: false, new: true })
    
    res.status(200).json({ success: true })
})

exports.deleteOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.orderId)

    await order.remove()

    res.status(200).json({ success: true })
})


// updating product stock
async function updateProductStock(productId, quantity) {
    try {
        const product = await Product.findById(productId)

        if (product.stock <= quantity) {
            return res.status(200).json({ success: false, msg: 'Stock is finished'})
        } else {
            product.stock = product.stock -  quantity 

            await product.save({ validateBeforeSave: false })
        }

    } catch(err) {
        next(new CustomError('Product stock is not updating.check server', 500))
    }
}