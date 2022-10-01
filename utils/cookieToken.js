const cookieToken = async (user, res, code) => {
    const token = await user.getJwtToken()

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_TIME * 60 * 60 * 24 * 1000
        ),
        httpOnly: true
    }
    user.password = undefined
    res.status(code).cookie('token', token, options).json({ success: true, token, user}) 
}

module.exports = cookieToken