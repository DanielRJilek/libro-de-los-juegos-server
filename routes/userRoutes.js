const express = require('express');
const path = require('path');
const router = express.Router();
const controller = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT');
const ownUser = require('../middleware/ownUser');

// router.use(verifyJWT);

router.route('/')
    .get(verifyJWT,controller.getAllUsers)
    .post(controller.createUser)
    .patch(verifyJWT, controller.updateUser)
    .delete(verifyJWT, controller.deleteUser)

router.use(verifyJWT);

router.route('/:userid/friends')
    .get(ownUser, controller.getAllFriends)
    .post(ownUser, controller.addFriend)
    .delete(ownUser, controller.deleteFriend)

module.exports = router;