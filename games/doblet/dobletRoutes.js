const express = require('express');
const router = express.Router();
const controller = require('./DobletController');
const verifyJWT = require('../../middleware/verifyJWT');

router.use(verifyJWT)

router.route('/')
    .post(controller.createDobletInstance)
    .delete(controller.deleteDobletInstance)

router.route('/:instance/')
    .get(controller.getAllData)

router.route('/:instance/play')
    .post(controller.play)

module.exports = router;