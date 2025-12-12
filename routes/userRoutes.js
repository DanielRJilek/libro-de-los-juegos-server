// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

const express = require('express');
const path = require('path');
const router = express.Router();
const controller = require('../controllers/usersController')

router.route('/')
    // .get(controller.getAllUsers)
    // .post(controller.createUser)
    // .patch(controller.updateUser)
    // .delete(controller.deleteUser)

module.exports = router;