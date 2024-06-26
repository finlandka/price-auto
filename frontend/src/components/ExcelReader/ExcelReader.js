import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Form, Button, Table, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

function ExcelReader( {onPriceListAdded} ) {
    const [data, setData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [priceListName, setPriceListName] = useState('');
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (event) => {
            const bstr = event.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            setData(data);
        };

        reader.readAsBinaryString(file);
    };

    const saveToMongo = async () => {
        if (!priceListName.trim()) {
            showAlert('danger', 'Пожалуйста, введите название прайс-листа');
            return;
        }

        try {
            const response = await axios.post('/api/saveExcelData', {
                data,
                fileName,
                priceListName
            });
            showAlert('success', response.data.message);
            // Очистка формы после успешного сохранения
            setData([]);
            setFileName('');
            setPriceListName('');

            onPriceListAdded();
        } catch (error) {
            showAlert('danger', 'Ошибка при сохранении данных');
        }
    };

    const showAlert = (variant, message) => {
        setAlert({ show: true, variant, message });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    };

    return (
        <Container className="mt-5">
            {alert.show && (
                <Alert variant={alert.variant} onClose={() => setAlert({ show: false, variant: '', message: '' })} dismissible>
                    {alert.message}
                </Alert>
            )}
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Form.Group controlId="priceListName" className="mb-3">
                        <Form.Label>Название прайс-листа</Form.Label>
                        <Form.Control
                            type="text"
                            value={priceListName}
                            onChange={(e) => setPriceListName(e.target.value)}
                            placeholder="Например: Шины"
                        />
                    </Form.Group>
                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Выберите Excel файл</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".xls,.xlsx"
                            onChange={handleFileUpload}
                        />
                    </Form.Group>
                    {data.length > 0 && (
                        <Button onClick={saveToMongo} className="mt-3">
                            Сохранить
                        </Button>
                    )}
                </Col>
            </Row>
            {data.length > 0 && (
                <Row className="mt-3">
                    <Col>
                        <Table striped hover>
                            <tbody>
                            {data.slice(0, 5).map((row, index) => (
                                <tr key={index}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                        {data.length > 5 && <p>Показано только первые 5 строк...</p>}
                    </Col>
                </Row>
            )}
        </Container>
    );
}

export default ExcelReader;