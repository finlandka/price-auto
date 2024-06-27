const ExcelData = require('../models/excelData');
const lunr = require('lunr');
require('lunr-languages/lunr.stemmer.support')(lunr);
require('lunr-languages/lunr.ru')(lunr);
require('lunr-languages/lunr.multi')(lunr);

function createIndex(documents) {
    return lunr(function() {
        this.use(lunr.multiLanguage('en', 'ru'));
        this.field('brand');
        this.field('article');
        this.field('name');
        this.ref('id');

        documents.forEach((doc, idx) => {
            this.add({
                id: idx,
                brand: doc[0],
                article: doc[1],
                name: doc[2]
            });
        });
    });
}

const roundNumber = (value) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : Math.round(numValue);
};

const saveExcelData = async (req, res) => {
    try {
        const { data, fileName, priceListName } = req.body;

        const roundedData = data.map((row, rowIndex) =>
            rowIndex === 0 ? row : row.map((cell, index) =>
                index === 1 ? cell : roundNumber(cell)
            )
        );

        const excelData = new ExcelData({
            name: priceListName,
            fileName,
            data: roundedData
        });

        await excelData.save();
        res.status(201).json({ message: 'Данные успешно сохранены' });
    } catch (error) {
        console.error('Error saving Excel data:', error);
        res.status(500).json({ message: 'Ошибка при сохранении данных' });
    }
};

const searchProduct = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === '') {
            return res.json({ products: [] });
        }

        const allPriceLists = await ExcelData.find({});
        const allProducts = allPriceLists.flatMap(priceList => {
            if (!Array.isArray(priceList.data) || priceList.data.length === 0) {
                console.warn('Price list data is not an array:', priceList.name);
                return [];
            }

            const index = createIndex(priceList.data);
            const searchResults = index.search(query);

            return searchResults.map(result => ({
                ...priceList.data[result.ref],
                priceListName: priceList.name,
                priceListId: priceList._id
            }));
        });

        if (allProducts.length > 0) {
            res.json({ products: allProducts });
        } else {
            res.status(404).json({ message: 'Не найдено' });
        }
    } catch (error) {
        console.error('Error searching product:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    saveExcelData,
    searchProduct
};