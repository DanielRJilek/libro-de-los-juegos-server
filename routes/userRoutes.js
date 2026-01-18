const express = require('express');
const path = require('path');
const router = express.Router();
const controller = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT');
const ownUser = require('../middleware/ownUser');

// router.use(verifyJWT);

router.route('/')
    .get(verifyJWT,controller.getMyData)
    .post(controller.createUser)

router.use(verifyJWT);

router.route('/:userid')
    .get(controller.getPublicUserData)
    .patch(ownUser, controller.updateUser)
    .delete(ownUser, controller.deleteUser)

router.route('/:userid/private')
    .get(controller.getPrivateUserData)

router.route('/:userid/friends')
    .get(ownUser, controller.getAllFriends)
    .post(ownUser, controller.addFriend)
    .delete(ownUser, controller.deleteFriend)

router.route('/:userid/friends/requests')
    .get(ownUser, controller.getAllFriendRequests)
    .post(ownUser, controller.sendFriendRequest)
    .delete(ownUser, controller.deleteFriendRequest)

module.exports = router;