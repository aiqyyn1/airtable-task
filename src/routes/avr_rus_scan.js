const router = require('express').Router()
const getFirsController = require('../controllers/avr.controller');
router.get('/avr_rus_scan', getFirsController)

module.exports = router
