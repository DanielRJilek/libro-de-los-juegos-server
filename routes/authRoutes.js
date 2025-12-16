const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

router.route('/login')
    .post(controller.login)

router.route('/logout')
    .post(controller.logout)

router.route('/refresh')
    .get(controller.refresh)

module.exports = router;