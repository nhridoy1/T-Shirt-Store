const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        maxlength: [120, 'product name should not be more than 120 character']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        maxlength: [6, 'product price should not be more than 6 digits']
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'],
    },
    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select a category from- shortsleeves, longsleeves, sweat-shirt and hoodies'],
        enum: {
            values: [
                'shortsleeves',
                'longsleeves',
                'sweatshirt',
                'hoodies'
            ],
            message: 'please select a category only from- shortsleeves, longsleeves, sweat-shirt and hoodies'
        }
    },
    brand: {
        type: String,
        required: [true, 'Please add a brand for clothing'],
    },
    stock: {
        type: Number,
        required: [true, 'how many stock do you have.provide that']
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    }, 
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema)