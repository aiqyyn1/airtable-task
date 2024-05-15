const router = require('express').Router();

const controller = require('../controllers/tolemshot_rus.controller');
router.get('/tolemshot_rus', controller);
module.exports = router;
