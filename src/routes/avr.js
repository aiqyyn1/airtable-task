const router = require('express').Router();
const controller = require('../controllers/avr.controller');

//TODO: refactor code - rename "first controller" to "avr_rus"

router.get('/avr_rus_print', controller);

module.exports = router;
