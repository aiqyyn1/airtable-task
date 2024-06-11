const router = require('express').Router();
const { dogovorController, getAirtabelData } = require('../controllers/dogovor.controller');

router.post('/dogovor', dogovorController);
router.get('/dogovor', getAirtabelData);
module.exports = router;
