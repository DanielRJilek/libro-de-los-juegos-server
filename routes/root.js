const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({ ok: true });
});

router.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
});

module.exports = router;
