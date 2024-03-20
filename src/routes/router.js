const router = require('express').Router();

const getFirsController = require('../controllers/first.controller');
//TODO: refactor code - rename "first controller" to "tolemshot_rus_controller" 
router.get('/blanks', getFirsController);
module.exports = router;
