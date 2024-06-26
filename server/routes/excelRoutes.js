const express = require('express');
const router = express.Router();
const excelController = require('../controllers/excelController');

router.post('/saveExcelData', excelController.saveExcelData);
router.get('/searchProduct', excelController.searchProduct);

module.exports = router;