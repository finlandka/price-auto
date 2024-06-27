import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, Alert, Modal } from 'react-bootstrap';

function PriceListsView({ loggedIn, shouldRefetch, setShouldRefetch }) {
    const [priceLists, setPriceLists] = useState([]);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchPriceLists = useCallback(async () => {
        try {
            const response = await axios.get('/api/priceLists');
            setPriceLists(response.data);
            if (typeof setShouldRefetch === 'function') {
                setShouldRefetch(false);
            }
        } catch (error) {
            console.error('Error fetching price lists:', error);
            showAlert('danger', 'Ошибка при загрузке прайс-листов');
        }
    }, [setShouldRefetch]);

    useEffect(() => {
        fetchPriceLists();
    }, [fetchPriceLists]);

    useEffect(() => {
        if (shouldRefetch) {
            fetchPriceLists();
        }
    }, [shouldRefetch, fetchPriceLists]);

    const handleDelete = useCallback((id) => {
        setDeleteId(id);
        setShowConfirmModal(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        try {
            await axios.delete(`/api/priceLists/${deleteId}`);
            fetchPriceLists();
            showAlert('success', 'Прайс-лист успешно удален');
        } catch (error) {
            console.error('Error deleting price list:', error);
            showAlert('danger', 'Ошибка при удалении прайс-листа');
        }
        setShowConfirmModal(false);
    }, [deleteId, fetchPriceLists]);

    const handleDownload = useCallback(async (id, fileName) => {
        try {
            const response = await axios.get(`/api/priceLists/${id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showAlert('success', 'Файл успешно скачан');
        } catch (error) {
            console.error('Ошибка:', error);
            showAlert('danger', 'Ошибка при скачивании файла');
        }
    }, []);

    const showAlert = useCallback((variant, message) => {
        setAlert({ show: true, variant, message });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    }, []);

    return (
        <>
            {alert.show && (
                <Alert variant={alert.variant} onClose={() => setAlert({ show: false, variant: '', message: '' })} dismissible>
                    {alert.message}
                </Alert>
            )}
            <Table striped bordered hover responsive>
                <thead>
                <tr>
                    <th>Название</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {priceLists.map((priceList) => (
                    <tr key={priceList._id}>
                        <td>{priceList.name}</td>
                        <td>
                            <Button variant="primary" className="mb-1 me-1" size="sm" onClick={() => handleDownload(priceList._id, priceList.fileName)}>
                                Скачать
                            </Button>
                            {loggedIn && (
                                <Button variant="danger" size="sm" className="mb-1" onClick={() => handleDelete(priceList._id)}>
                                    Удалить
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение удаления</Modal.Title>
                </Modal.Header>
                <Modal.Body>Вы уверены, что хотите удалить этот прайс-лист?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Удалить
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default PriceListsView;