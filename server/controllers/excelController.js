const ExcelData = require('../models/excelData');
const lunr = require('lunr');
require('lunr-languages/lunr.stemmer.support')(lunr);
require('lunr-languages/lunr.ru')(lunr);
require('lunr-languages/lunr.multi')(lunr);

function createIndex(documents) {
    return lunr(function() {
        this.use(lunr.multiLanguage('en', 'ru'));
        this.field('brand');
        this.field('article', { boost: 10 });
        this.field('name');
        this.ref('id');

        // Добавляем пользовательский токенайзер
        this.tokenizer = function(str) {
            // Сначала применяем стандартный токенайзер
            const standardTokens = lunr.tokenizer(str);

            // Затем добавляем версию без дефисов для каждого токена
            const additionalTokens = standardTokens.map(token => {
                const tokenWithoutDash = token.toString().replace(/-/g, '');
                return tokenWithoutDash !== token.toString() ? lunr.Token.fromString(tokenWithoutDash) : null;
            }).filter(Boolean);

            return [...standardTokens, ...additionalTokens];
        };


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

        const queryWithoutDash = query.replace(/-/g, '');
        const searchQuery = `${query} ${queryWithoutDash} article:${query} article:${queryWithoutDash}`;

        const allPriceLists = await ExcelData.find({});
        const allProducts = allPriceLists.flatMap(priceList => {
            if (!Array.isArray(priceList.data) || priceList.data.length === 0) {
                console.warn('Price list data is not an array:', priceList.name);
                return [];
            }

            const index = createIndex(priceList.data);
            const searchResults = index.search(searchQuery);

            return searchResults.map(result => ({
                ...priceList.data[result.ref],
                priceListName: priceList.name,
                priceListId: priceList._id,
                score: result.score
            }));
        });

        if (allProducts.length > 0) {
            allProducts.sort((a, b) => b.score - a.score);
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