const cookieResponse = (res, accessTokenJwt, refreshTokenJwt) => {
    res.cookie('accessToken', accessTokenJwt, {
        httpOnly: true,
        maxAge: 1000
    })
    res.cookie('refreshToken', refreshTokenJwt, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
    })
}

module.exports = cookieResponse