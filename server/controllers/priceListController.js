const ExcelData = require('../models/excelData');
const ExcelJS = require('exceljs');

const getPriceLists = async (req, res) => {
    try {
        const priceLists = await ExcelData.find({}, 'name fileName createdAt');
        res.json(priceLists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении прайс-листов' });
    }
}

const deletePriceList = async (req, res) => {
    try {
        await ExcelData.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Прайс-лист успешно удален' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при удалении прайс-листа' });
    }
}

const downloadPriceList = async (req, res) => {
    try {
        const priceList = await ExcelData.findById(req.params.id);
        if (!priceList) {
            return res.status(404).json({ message: 'Прайс-лист не найден' });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Price List');

        worksheet.addRows(priceList.data);

        // Применяем стили к заголовкам
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Применяем стили ко всем ячейкам
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Выравнивание для числовых значений
                if (typeof cell.value === 'number') {
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                }
            });
        });

        // Автоматически подгоняем ширину столбцов
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });

        const encodedFilename = encodeURIComponent(priceList.fileName.replace(/\s/g, '_'));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при скачивании прайс-листа' });
    }
}

module.exports = {
    getPriceLists,
    deletePriceList,
    downloadPriceList
}