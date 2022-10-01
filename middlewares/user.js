const User = require('../models/user')
const CustomError = require('../utils/customError')
const jwt = require('jsonwebtoken')

exports.isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token ||
         req.body.token ||
         req.header('Authorization').replace('Bearer ', '')

        if (!token) {
            return next(new CustomError('to access this page.please login', 401))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById( decoded.id )

        next()
        
    } catch(err) {
        next(new CustomError(err.message, 500))
    }
}

// treating as an array to this parameter (...roles)
exports.customRole = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, msg: 'You are not allowed for this resources'})
        }
        next()
    }
}