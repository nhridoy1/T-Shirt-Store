const router = require('express').Router()
const { isLoggedIn, customRole } = require('../middlewares/user')
const {
    addNewProduct,
    allProducts,
    allProductsAdmin,
    oneProduct,
    updateProduct,
    deleteProduct,
    addReview
} = require('../controllers/productController')

// user routes
router.route('/products').get(allProducts)
router.route('/product/:productId').get(oneProduct)


// admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addNewProduct)
router.route('/admin/products').get(isLoggedIn, customRole('admin'), allProductsAdmin)
router.route('/admin/product/:productId')
    .put(isLoggedIn, customRole('admin'), updateProduct)
    .delete(isLoggedIn, customRole('admin'), deleteProduct)


module.exports = router