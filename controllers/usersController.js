const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const getAllUsers = asyncHandler(async (req,res) => {
    const users = await User.find().select('-password').lean();
    console.log(users);
    if (!users) {
        return res.status(400).json({message: 'No users found'});
    }
    res.json(users);
});

const createUser = asyncHandler(async (req,res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: "All fields required"});
    }

    const duplicate = await User.findOne({username}).lean().exec();
    if (duplicate) {
        return res.status(409).json({message: "Duplicate username"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userObject = {username, "password": hashedPassword};
    const user = await User.create(userObject);
    if (user) {
        res.status(201).json({message: `New user ${username} created `});
    }
    else {
        res.status(400).json({message: "Invalid user data received"});
    }
});

const updateUser = asyncHandler(async (req,res) => {
    const {id} = req.user;
    if (!id) {
        return res.status(400).json({message: "User ID required"});
    }
    const {username, password, active} = req.body;
    if (!username || !active) {
        return res.status(400).json({message: "All fields required"});
    }

    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({message: "user not found"});
    }
    const duplicate = await User.findOne({username}).lean().exec();
    if (duplicate && duplicate.id.toString() != id) {
        return res.status(409).json({message: "Duplicate username"});
    }

    user.username = username;
    user.active = active;
    if (password) {
        user.password = await bcrypt.hash(password, 10); 
    }
    const updatedUser = await user.save();
    res.json({message: `${updatedUser.username} updated`})
});

const deleteUser = asyncHandler(async (req,res) => {
    const {id} = req.user;
    if (!id) {
        return res.status(400).json({message: "User ID required"});
    }

    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({message: "User not found"});
    }
    const result = await user.deleteOne();
    const reply = `User with ID ${id} deleted`;
    res.json(reply);
});

module.exports = {getAllUsers, createUser, updateUser, deleteUser}