const User = require('../models/user')
const CustomError = require('../utils/customError')
const cookieToken = require('../utils/cookieToken')
const cloudinary = require('cloudinary')
const mailHelper = require('../utils/emailHelper')
const crypto = require('crypto')

exports.signup = async (req, res, next) => {
    try {
        const {name, email, password} = req.body

        if (!email || !name || !password) {
            return next(new CustomError('name, email and password are required', 400))
        }

        if (!req.files) {
            return next(new CustomError('Photo is required for signup', 400))
        }

        let file = req.files.photo

        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, { folder: 'users', width: 150, crop: 'scale'})

        const user = await User.create({
            name,
            email,
            password,
            photo: {
                id: result.public_id,
                secure_url: result.secure_url
            }
        })
        
        cookieToken(user, res, 201)
    } catch(err) {
        return next(new CustomError(err, 500))
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        // check for presence of email and password
        if (!email || !password) {
            return next(new CustomError('Please provide email and password'), 400)
        }

        // get user from DB
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return next(new CustomError('Email or password does not match', 400))
        }

        const isPasswordCorrect = await user.isPasswordValid(password)

        if (!isPasswordCorrect) {
            return next(new CustomError('Email or password does not match', 400))
        }

        // sending token with status code
        cookieToken(user, res, 200)
    } catch (err) {
        return next(new CustomError(err, 500))
    }
}

exports.logout = async (req, res, next) => {
    try {
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        })
        res.status(200).json({
            success: true,
            msg: 'Logout success'
        })
    } catch (err) {
        return next(new CustomError(err.message, 500))
    }
}

exports.forgotpassword = async (req, res, next) => {
    try {
        // collect email
       const { email } = req.body

       if (!email) {
        return next(new CustomError('Please provide your email', 400)) 
       }

       const user = await User.findOne({ email })

       if (!user) {
        return next(new CustomError('User does not found', 400))
       }

       // get token from user model methods
       const forgotToken = user.getForgotPasswordToken()

       // save user fields in DB
       await user.save({ validateBeforeSave: false })

       // create a url
       const craftingUrl = `${req.protocol}://${req.get('host')}/password/reset/${forgotToken}}`

       const message = `Click the following button \n\n ${craftingUrl}`
    
       // attempt to send mail 
       await mailHelper({
        message,
        email: user.email,
        subject: 'T-shirt Store  password reset email'
       })

       res.status(200).json({ success: true, msg: 'Email sent successfully.Check your email'})
    } catch (err) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({ validateBeforeSave: false })

        return next(new CustomError(err.message, 500))
    }
}

exports.passwordReset = async (req, res, next) => {
  try {
    const token = req.params.token
    
    const encryptedToken = crypto.createHash('sha256').update(token).digest('hex')
    
    const user = await User.findOne({
         encryptedToken,
         forgotPasswordExpiry: { $gt: Date.now() } 
    }) 

    if (!user) {
        return next(new CustomError('Token is invalid or expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({success: false, msg: 'password is not matching'})
    }

    user.password = req.body.password

    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined

    await user.save({ validateBeforeSave: false })

    // send a json response or send token
    cookieToken(user, res, 200)

  } catch (error) {
    return next(new CustomError(error.message, 500))
  }
}

exports.getLoggedInUserDetails = async (req, res, next) => {

    try {
        // req.user will be added by middleware
        const user = await User.findById(req.user._id)

        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
      return next(new CustomError(error.message, 500))
    }

}

exports.changePassword = async (req, res, next) => {
    try {
        // req.user will be added by middleware
        const userId = req.user._id

        const user = await User.findById(userId).select("+password")

        const isOldPasswordCorrect = await user.isPasswordValid(req.body.password)
        
        if (!isOldPasswordCorrect) {
            return res.status(400).json({ 
                success: false,
                msg: 'password is incorrect'
            })
        }

        user.password = req.body.newPassword

        await user.save({ validateBeforeSave: false })

        res.status(200).json({ success: true, msg: 'password updated successfully'})

    } catch (error) {
      return next(new CustomError(error.message, 500))
    }
}

exports.userDetailsUpdate = async (req, res, next) => {
    try {

        let newData = {
            name: req.body.name,
            email: req.body.email,
        }

        // if files are there then do the stuff
        if (req.files) {
            const user = await User.findById(req.user._id)

            const imageId = user.photo.id 

            // delete existing photo on cloudinary
            await cloudinary.v2.uploader.destroy(imageId)

            // upload the new photo on cloudinary
            const newPhoto = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
                folder: 'users',
                width: 150,
                crop: 'scale'
            })

            newData.photo = {
                id: newPhoto.public_id,
                secure_url: newPhoto.secure_url
            }
        }

        const user = await User.findByIdAndUpdate(req.user._id, newData, {
            new: true,
            runValidators: true
        })
        
        res.status(200).json({
            success: true,
            msg: 'user updated successfully',
            user
        })

    } catch (error) {
      return next(new CustomError(error.message, 500))
    }
}

// these controller is used by admin only
exports.allUsers = async (req, res, next) => {
    try {
        const users = await User.find({})

        res.status(200).json({
            success: true,
            users
        })
    } catch (err) {
        next(new CustomError(err.message, 500))
    }
}

exports.getSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId)

        if (!user) {
            res.status(400).json({msg: 'No user found'})
        }

        res.status(200).json({success: true, user})

    } catch (err) {
        next(new CustomError(err.message, 500))
    }
}

exports.updateSingleUser = async (req, res, next) => {
    try {

        let newData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        }

        const user = await User.findByIdAndUpdate(req.params.userId, newData, {
            new: true,
            runValidators: true
        })
        
        res.status(200).json({
            success: true,
            msg: 'user updated successfully',
            user
        })

    } catch (error) {
      return next(new CustomError(error.message, 500))
    }
}

exports.deleteSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId)

        await cloudinary.v2.uploader.destroy(user.photo.id)
        
        await User.deleteOne({ _id: req.params.userId })

        res.status(200).json({ success: true })
    } catch (error) {
      return next(new CustomError(error.message, 500))
    }
}

// this controller is used by manager
exports.roleOfUser = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'user' })

        res.status(200).json({
            success: true,
            users
        })
    } catch (err) {
        next(new CustomError(err.message, 500))
    }
}