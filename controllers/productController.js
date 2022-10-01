const Product = require('../models/product')
const { BigPromise } = require('../middlewares/bigPromise')
const cloudinary = require('cloudinary').v2
const CustomError = require('../utils/customError')
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

    const products = await new WhereClause(Product, req.query).search().filter()
    console.log(products);

    const filteredProductCount =  products.length 

    products.pagination(resultPerPage)
    products = await products.base

    res.status(200).json({
        success: true,
        products,
        filteredProductCount,
        totalProductCount
    })
})

// dummy controller 
exports.dummy = BigPromise((req, res, next) => {
    console.log(req.query);
    res.send('hi')
})