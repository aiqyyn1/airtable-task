const router = require('express').Router();
const getFirsController = require('../controllers/pdfmerger.controller');
router.get('/blank_zakazov', getFirsController);

module.exports = router;
