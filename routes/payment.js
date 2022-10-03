const router = require('express').Router()
const { isLoggedIn } = require('../middlewares/user')
const {
    sendStripeKey,
    captureStripePayment,
    sendRazorKey,
    captureRazorPayment
} = require('../controllers/paymentController')

router.route('/stripekey').get(isLoggedIn, sendStripeKey)
router.route('/razorkey').get(isLoggedIn, sendRazorKey)

router.route('/capturestripe').post(isLoggedIn, captureStripePayment)
router.route('/capturerazor').post(isLoggedIn, captureRazorPayment)

module.exports = router