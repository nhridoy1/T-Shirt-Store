const Product = require('../models/product')
const { BigPromise } = require('../middlewares/bigPromise')
const cloudinary = require('cloudinary').v2
const WhereClause = require('../utils/whereClause')


exports.addNewProduct = BigPromise(async (req, res, next) => {
    // handling product photo
    const imageArray = []

    if (!req.files) {
        return res.status(400).json({success: false, msg: 'Please provide a product photo'})
    }

    for (let i = 0; i < req.files.photos.length; i++) {
        const result = await cloudinary.uploader.upload(req.files.photos[i].tempFilePath, {
            folder: 'productphotos'
        })
        imageArray.push({id: result.public_id, secure_url: result.secure_url})
    }

    req.body.photos = imageArray
    req.body.user = req.user._id

    const product = await Product.create(req.body)
    res.status(201).json({ success: true, product})
})

exports.allProducts = BigPromise(async (req, res, next) => {
    const resultPerPage = 6

    const totalProductCount = await Product.countDocuments()

    const productsObj = await new WhereClause(Product, req.query).search().filter()

    let products = await productsObj.base

    const filteredProductCount =  products.length 

    console.log(productsObj);
    productsObj.pagination(resultPerPage)

    products = await productsObj.base.clone()

    res.status(200).json({
        success: true,
        products,
        filteredProductCount,
        totalProductCount
    })
})

exports.oneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.productId)

    if (!product) {
        return res.status(400).json({ success: false, msg: 'No product found'})
    }

    res.status(200).json({ success: true, product})
})

exports.addReview = BigPromise(async (req, res, next) => {
    const { rating, comment, productId } = req.body
    
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find((review) => {
        review.user.toString() == req.user._id.toString() ? true : false
    })   

    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment
                review.rating = rating
            }
        })
    } else {
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length
    }

    // adjust ratings
    product.ratings = product.reviews.reduce((acc, item) => {
        (item.rating + acc, 0) / product.reviews.length
    })

    // save 
    await product.save({ validateBeforeSave: false })

    res.status(200).json({ success: true })
})

exports.deleteReview = BigPromise(async (req, res, next) => {
    const { productId } = req.query

    const product = await Product.findById(productId)

    const reviews = product.reviews.filter(
        (review) => review.user.toString() === req.user._id.toString()
    )

    const numberOfReviews = reviews.length

    // adjust ratings
    product.ratings = product.reviews.reduce((acc, item) => {
        (item.rating + acc, 0) / product.reviews.length
    })

    // update the product
    await Product.findByIdAndUpdate(productId, {
        reviews,
        numberOfReviews,
        ratings
    }, {
        new: true,
        runValidators: true
    })
    
    res.status(200).json({ success: true })

})

exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)

    res.status(200).json({success: true, reviews: product.reviews })
})

// only admin controllers
exports.allProductsAdmin = BigPromise(async (req, res, next) => {
    const products = await Product.find({})

    res.status(200).json({success: true, products})
})

exports.updateProduct = BigPromise(async (req, res, next) => {
    let product = await Product.findById(req.params.productId)

    if (!product) {
        return res.status(400).json({ success: false, msg: 'No product found'})
    }

    let imagesArray = []

    if (req.files) {
        //destroy the existing photos
        for (let i = 0; i < product.photos.length; i++) {
            await cloudinary.uploader.destroy(product.photos[i].id)
        }

        // upload and save the photos
        for (let i = 0; i < req.files.photos.length; i++) {
            const result = await cloudinary.uploader.upload(req.files.photos[i].tempFilePath, {
                folder: "productphotos"
            })
            imagesArray.push({id: result.public_id, secure_url: result.secure_url})
        }

        req.body.photos = imagesArray
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.productId, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({ success: true, updatedProduct})

})

exports.deleteProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.productId)

    if (!product) {
        return res.status(400).json({ success: false, msg: 'No product found'})
    }

    //destroy the existing photos
    for (let i = 0; i < product.photos.length; i++) {
        await cloudinary.uploader.destroy(product.photos[i].id)
    }
    
    await product.remove()

    res.status(200).json({ success: true, msg: "product was deleted"})

})