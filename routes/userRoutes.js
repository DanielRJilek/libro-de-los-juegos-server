const express = require('express');
const path = require('path');
const router = express.Router();
const controller = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT');

// router.use(verifyJWT);

router.route('/')
    .get(verifyJWT,controller.getAllUsers)
    .post(controller.createUser)
    .patch(verifyJWT, controller.updateUser)
    .delete(verifyJWT, controller.deleteUser)

module.exports = router;