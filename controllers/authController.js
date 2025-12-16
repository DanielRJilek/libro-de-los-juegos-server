const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = asyncHandler(async (req, res) => {
    // authentication
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: "All fields are required"});
    }
    const user = await User.findOne({username}).exec();
    if (!user || !user.active) {
        return res.status(401).json({message: "Unauthorized"})
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({message: "Unauthorized"});
    }

    // authorization
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": user.username
            }
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1m"}
    )

    const refreshToken = jwt.sign(
        {"username": user.username}, process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '1d'}
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true, 
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000
    })

    res.json({accessToken});
});

const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) {
        return res.sendStatus(204)
    }
    res.clearCookie('jwt', {httpOnly: true, sameSite: true, secure: true})
    res.json({message: "Cookie cleared"});
});

const refresh = asyncHandler(async (req,res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.status(401).json({message: "Unauthorized"})
    }
    const refreshToken = cookies.jwt;
    jwt.verify(
        refreshToken, process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) {
                return res.status(403).json({message: "Forbidden"})
            }
            const user = await User.findOne({ username: decoded.username})
            if (!user) {
                return res.status(401).json({message: "Unauthorized"})
            }
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": user.username
                    }
                },
                process.env.ACCESS_TOKEN_SECRET, 
                {expiresIn: "1m"}
            )
            res.json({accessToken});
        })
    )
});

module.exports = { login, logout, refresh}

