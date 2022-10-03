const { BigPromise } = require('../middlewares/bigPromise')
const stripe = require('stripe')(process.env.STRIPE_SECRET)


exports.sendStripeKey = BigPromise((req, res, next) => {
    res.status(200).json({ stripeKey: process.env.STRIPE_API_KEY })
})

exports.captureStripePayment = BigPromise(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "usd",
      
        // optional
        metadata: {intregration_check: 'accept_a_payment'}
    });
    
    res.status(200).json({ 
        success: true,
        amount: req.body.amount,
        client_secret: paymentIntent.client_secret
    })
})

exports.sendRazorKey = BigPromise((req, res, next) => {
    res.status(200).json({ stripeKey: process.env.RAZORPAY_API_KEY })
})

exports.captureRazorPayment = BigPromise(async (req, res, next) => {

    let instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET })

    const myOrder = await instance.orders.create({
        amount: req.body.amount,
        currency: "INR",
    })

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    })
})