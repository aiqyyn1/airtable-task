const router = require('express').Router();

const getFirsController = require('../controllers/tolemshot_rus.controller');
//TODO: refactor code - rename "first controller" to "tolemshot_rus_controller" 
router.get('/tolemshot_rus', getFirsController);
module.exports = router;
