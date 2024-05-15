const router = require('express').Router();
const controller = require('../controllers/dogovor.controller');
router.get('/dogovor', controller);

module.exports = router;
