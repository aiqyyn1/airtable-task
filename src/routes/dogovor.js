const router = require('express').Router();
const controller = require('../controllers/dogovor.controller');
router.get('/blank_zakazov', controller);

module.exports = router;
