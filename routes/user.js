const router = require('express').Router()

const { 
    signup,
    login,
    logout,
    forgotpassword,
    passwordReset,
    getLoggedInUserDetails,
    changePassword,
    userDetailsUpdate,
    allUsers,
    roleOfUser,
    getSingleUser,
    updateSingleUser,
    deleteSingleUser,
} = require('../controllers/userController')
const { isLoggedIn, customRole } = require('../middlewares/user')

// user routes
router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotpassword').post(forgotpassword)
router.route('/password/reset/:token').post(passwordReset)
router.route('/userdashboard').get(isLoggedIn, getLoggedInUserDetails)
router.route('/user/password/update').post(isLoggedIn, changePassword)
router.route('/user-info-update').post(isLoggedIn, userDetailsUpdate)

// admin routes
router.route('/admin/users').get(isLoggedIn, customRole('admin'), allUsers)
router.route('/admin/user/:userId')
    .get(isLoggedIn, customRole('admin'), getSingleUser)
    .put(isLoggedIn, customRole("admin"), updateSingleUser)
    .delete(isLoggedIn, customRole('admin'), deleteSingleUser)


router.route('/manager/users').get(isLoggedIn, customRole('manager'), roleOfUser)

module.exports = router