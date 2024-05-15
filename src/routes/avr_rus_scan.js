const router = require('express').Router()
const controller = require('../controllers/avr.controller');
router.get('/avr_rus_scan', controller)

module.exports = router
