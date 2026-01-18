const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const getMyData = asyncHandler(async (req,res) => {
    const {id} = req.user;
    const user = await User.findById(id).select('username');
    if (!user) {
        return res.status(400).json({message: "No user found"});
    }
    res.json(user);
});

// For now just username. Later add profile pic, etc
const getPublicUserData = asyncHandler(async (req,res) => {
    const id = req.params.userid;
    const user = await User.findById(id).select('username');
    if (!user) {
        return res.status(400).json({message: "No user found"});
    }
    res.json(user);
})

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
    const userObject = {"username": username, "password": hashedPassword, "activeGames": []};
    const user = await User.create(userObject);
    if (user) {
        res.status(201).json({message: `New user ${username} created`});
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

const getAllFriends = asyncHandler(async (req,res) => {
    const id = req.user.id;
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({message: "User not found"});
    }
    const friends = await User.find({_id: {$in: user.friends}}).select('username').exec();
    res.json(friends);
});

const addFriend = asyncHandler(async (req,res) => {
    const id = req.user.id;
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({message: "User not found"});
    }
    const {friendID} = req.body;
    if (!friendID) {
        return res.status(400).json({message: "All fields required"});
    }
    if (friendID == id) {
        return res.status(400).json({message: "Can't befriend yourself"});
    }
    const inFriendList = await User.find({    _id: id,
                                        friends: {"$in": friendID}})
    if (inFriendList.length != 0) {
        return res.status(409).json({message: "Already friends"});
    }
    const requested = await User.find({    _id: id,
                                        friendRequests: {"$in": friendID}})
    if (requested.length == 0) {
        return res.status(409).json({message: "User has not received a friend request from the other user"});
    }
    const friend = await User.findById(friendID).exec();
    if (!friend) {
        return res.status(409).json({message: "Can't find user to befriend"});
    }
    user.friends.addToSet(friendID);
    user.friendRequests.pull(friendID);
    user.save();
    friend.friends.addToSet(id);
    friend.save();
    res.status(201).json({message: `Friend added`});

});

const deleteFriend = asyncHandler(async (req,res) => {
    const id = req.user.id;
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({message: "User not found"});
    }
    const {friendID} = req.body;
    if (!friendID) {
        return res.status(400).json({message: "All fields required"});
    }
    const friend = await User.find({    _id: id,
                                        friends: {"$in": friendID}})
    if (friend.length == 0) {
        return res.status(409).json({message: "Not friends"});
    }
    user.friends.pull(friendID);
    user.save();
    friend.friends.pull(id);
    friend.save();
    res.status(201).json({message: `Friend removed`});
});

const getAllFriendRequests = asyncHandler(async (req,res) => {
    const id = req.user.id;
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({message: "User not found"});
    }
    const friendRequests = await User.find({_id: {$in: user.friendRequests}}).select('username').exec();
    res.json(friendRequests);
});

const sendFriendRequest = asyncHandler(async (req,res) => {
    const id = req.user.id;
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({message: "User not found"});
    }
    const {username} = req.body;
    const friendID = await User.find({username}).select("_id").exec();
    // console.log(friendID);
    if (!friendID) {
        return res.status(400).json({message: "All fields required"});
    }
    if (friendID == id) {
        return res.status(400).json({message: "Can't befriend yourself"});
    }
    const inFriendList = await User.find({    _id: id,
                                        friends: {"$in": friendID}})
    if (inFriendList.length != 0) {
        return res.status(409).json({message: "Already friends"});
    }
    const requests = await User.find({    _id: friendID,
                                        friendRequests: {"$in": id}})
    if (requests.length != 0) {
        return res.status(409).json({message: "Friend request already sent"});
    }
    const friend = await User.findById(friendID).exec();
    if (!friend) {
        return res.status(409).json({message: "Can't find user to befriend"});
    }
    friend.friendRequests.addToSet(id);
    friend.save();
    res.status(201).json({message: `Friend request sent`});
});

const deleteFriendRequest = asyncHandler(async (req,res) => {

});

const addActiveGame = asyncHandler(async (req,res) => {

});

const acceptGameInvite = asyncHandler(async (req,res) => {

});

module.exports = {getMyData, getPublicUserData, createUser, updateUser, deleteUser, getAllFriends, addFriend, deleteFriend, 
    getAllFriendRequests, sendFriendRequest, deleteFriendRequest}