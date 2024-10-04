// rutas principales 
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hola memo');
});

module.exports = router;