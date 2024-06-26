const router = require('express').Router();
const {getSecondController} = require('../controllers/avr.controller');
router.get('/avr_rus_scan', getSecondController);

module.exports = router;
