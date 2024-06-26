const ExcelData = require('../models/excelData');
const lunr = require('lunr');
require('lunr-languages/lunr.stemmer.support')(lunr);
require('lunr-languages/lunr.ru')(lunr);
require('lunr-languages/lunr.multi')(lunr);

function createIndex(documents) {
    const index = lunr(function() {
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

    return index;
}

const saveExcelData = async (req, res) => {
    try {
        const { data, fileName, priceListName } = req.body;

        const roundedData = data.map((row, rowIndex) => {
            if (rowIndex === 0) {
                return row;
            }
            return row.map((cell, index) => {
                if (index === 1) {
                    return cell;
                } else if (index === 4) {
                    return isNaN(cell) ? cell : Math.round(Number(cell));
                } else if (typeof cell === 'string') {
                    const numValue = parseFloat(cell);
                    return isNaN(numValue) ? cell : Math.round(numValue);
                }
                return cell;
            });
        });

        const excelData = new ExcelData({
            name: priceListName,
            fileName: fileName,
            data: roundedData
        });

        await excelData.save();

        res.status(201).json({ message: 'Данные успешно сохранены' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при сохранении данных' });
    }
}

const searchProduct = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === '') {
            return res.json({ products: [] });
        }


        const allPriceLists = await ExcelData.find({});

        let allProducts = [];

        for (const priceList of allPriceLists) {
            if (!Array.isArray(priceList.data) || priceList.data.length === 0) {
                console.warn('Price list data is not an array:', priceList.name);
                continue;
            }

            const index = createIndex(priceList.data);

            const searchResults = index.search(query);

            const products = searchResults.map(result => {
                const product = priceList.data[result.ref];
                return {
                    ...product,
                    priceListName: priceList.name,
                    priceListId: priceList._id
                };
            });

            allProducts = allProducts.concat(products);

        }

        if (allProducts.length > 0) {
            res.json({ products: allProducts });
        } else {
            res.status(404).json({ message: 'Не найдено' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

module.exports = {
    saveExcelData,
    searchProduct
};