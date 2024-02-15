const router = require('express').Router()
const getFirsController = require('../controllers/avr.controller');
router.get('/blanks1', getFirsController)

module.exports = router
