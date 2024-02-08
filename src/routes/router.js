const router = require('express').Router();

const getFirsController = require('../controllers/first.controller');
router.get('/blanks', getFirsController);
module.exports = router;
