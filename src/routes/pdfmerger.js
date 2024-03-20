const router = require('express').Router()
const getFirsController = require('../controllers/pdfmerger.controller');
router.get('/pdfmerger', getFirsController)

module.exports = router
