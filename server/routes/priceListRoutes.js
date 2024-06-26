const express = require('express');
const router = express.Router();
const priceListController = require('../controllers/priceListController');

router.get('/priceLists', priceListController.getPriceLists);
router.delete('/priceLists/:id', priceListController.deletePriceList);
router.get('/priceLists/:id/download', priceListController.downloadPriceList);

module.exports = router;