const mongoose = require('mongoose')

const connectWithDb = () => {
    try {
        mongoose.connect(process.env.DB_URL)
        console.log('DB got connected');
    } catch (error) {
        console.log('DB connection issues');
        console.log(error);
        process.exit(1)
    }
}

module.exports = connectWithDb