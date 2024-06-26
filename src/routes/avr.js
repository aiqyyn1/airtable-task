const router = require('express').Router();
const {getSecondController} = require('../controllers/avr.controller');

//TODO: refactor code - rename "first controller" to "avr_rus"

router.get('/avr_rus_print', getSecondController);

module.exports = router;
