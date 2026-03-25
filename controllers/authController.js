const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = asyncHandler(async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: "All fields are required"});
    }
    const user = await User.findOne({username}).exec();
    if (!user || !user.active) {
        return res.status(401).json({message: "Invalid username or password"})
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({message: "Invalid username or password"});
    }

    // authorization
    const accessToken = jwt.sign(
        {
            "id": user.id
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "60m"}
    )

    const refreshToken = jwt.sign(
        {"id": user.id}, process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '1d'}
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true, 
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000
    })

    res.json({'token': accessToken, 'id': user.id});
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
            const user = await User.findOne({ id: decoded})
            if (!user) {
                return res.status(401).json({message: "Unauthorized"})
            }
            const accessToken = jwt.sign(
                {
                    "id": user.id
                },
                process.env.ACCESS_TOKEN_SECRET, 
                {expiresIn: "1d"}
            )
            res.json({'token': accessToken, 'id': user.id});
        })
    )
});

module.exports = { login, logout, refresh}

