const router = require('express').Router()
const { isLoggedIn, customRole } = require('../middlewares/user')
const {
    addNewProduct,
    allProducts,
} = require('../controllers/productController')

// user routes
router.route('/products').get(allProducts)


// admin routes
router.route('/admin/product/add').post(isLoggedIn,customRole('admin'), addNewProduct)

module.exports = router