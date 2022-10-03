const router = require('express').Router()
const { isLoggedIn, customRole } = require('../middlewares/user')
const {
    addNewProduct,
    allProducts,
    allProductsAdmin,
    oneProduct,
    updateProduct,
    deleteProduct,
    addReview,
    deleteReview,
    getOnlyReviewsForOneProduct
} = require('../controllers/productController')

// user routes
router.route('/products').get(allProducts)
router.route('/product/:productId').get(oneProduct)
router.route('/review').put(isLoggedIn, addReview)
router.route('/review').delete(isLoggedIn, deleteReview)
router.route('/reviews').get(isLoggedIn, getOnlyReviewsForOneProduct)


// admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addNewProduct)
router.route('/admin/products').get(isLoggedIn, customRole('admin'), allProductsAdmin)
router.route('/admin/product/:productId')
    .put(isLoggedIn, customRole('admin'), updateProduct)
    .delete(isLoggedIn, customRole('admin'), deleteProduct)


module.exports = router