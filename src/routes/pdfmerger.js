const router = require('express').Router()
const getFirsController = require('../controllers/pdfmerger.controller');
/* TODO: refactor code - rename "first controller and pdfmerger.controller" 
to "blank zakazov controller" 
*/
router.get('/pdfmerger', getFirsController)

module.exports = router
