require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')


// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// regular middleware
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

// router middleware
app.use('/api/v1', user)
app.use('/api/v1', product)

// testing signup
app.use('/signup', (req, res) => {
    res.render('signup')
})

// export app js
module.exports = app