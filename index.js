require('dotenv').config()
const app = require('./app')
const connectWithDb = require('./config/db')
const cloudinary = require('cloudinary').v2

// connect with database
connectWithDb()

// cloudinary config goes here
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// spining the server
app.listen(process.env.PORT, () => {
    console.log(`Server is up and running on port ${process.env.PORT}`);
})