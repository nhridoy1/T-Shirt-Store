// try catch and async -await or bigPromise

// module.exports = func = (req, res, next) =>
//     Promise.resolve(func(req, res, next)).catch(next)


module.exports.BigPromise = (func) => {
    return (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch(next)
    }
}