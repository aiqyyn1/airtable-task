const router = require('express').Router();
const { nakladnayaController } = require('../controllers/nakladnaya.controller');
router.get('/nakladnaya', nakladnayaController);

module.exports = router;
