require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')


// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// regular middleware
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');


// cookies and file middleware
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/temp/'
}))

//  morgan middleware
app.use(morgan('tiny'))

// import all routes here
const user = require('./routes/user')
const product = require('./routes/product')
const payment = require('./routes/payment')
const order = require('./routes/order')

// router middleware
app.use('/api/v1', user)
app.use('/api/v1', product)
app.use('/api/v1', payment)
app.use('/api/v1', order)

// testing signup
app.use('/signup', (req, res) => {
    res.render('signup')
})
app.use('/api/v1', (req, res, next) => {
    res.status(200).json({success: true, msg: 'Hello From Pro_backend_developer'})
})

// export app js
module.exports = app