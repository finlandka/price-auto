import React, { useState } from 'react';
import { Button, Container, Row, Col, Tab, Tabs } from 'react-bootstrap';
import ExcelReader from '../ExcelReader/ExcelReader';
import PriceListsView from '../PriceListsView/PriceListsView';
import ChangePassword from '../ChangePassword/ChangePassword';

function Admin({ onLogout, loggedIn }) {
    const [shouldRefetch, setShouldRefetch] = useState(false);

    const handlePriceListAdded = () => setShouldRefetch(true);

    const handlePasswordChange = async (currentPassword, newPassword) => {
        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        return await response.json();
    };

    return (
        <Container>
            <h2 className="my-4">Админ-панель</h2>
            <Tabs defaultActiveKey="price-lists" className="mb-3">
                <Tab eventKey="price-lists" title="Прайс-листы">
                    <PriceListsView
                        loggedIn={loggedIn}
                        shouldRefetch={shouldRefetch}
                        setShouldRefetch={setShouldRefetch}
                    />
                </Tab>
                <Tab eventKey="add" title="Добавить">
                    <ExcelReader onPriceListAdded={handlePriceListAdded} />
                </Tab>
                <Tab eventKey="change-password" title="Сменить пароль">
                    <ChangePassword onPasswordChange={handlePasswordChange} />
                </Tab>
                <Tab eventKey="logout" title="Выйти">
                    <Row className="justify-content-center mt-4">
                        <Col xs="auto">
                            <Button variant="danger" onClick={onLogout}>
                                Выйти
                            </Button>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
        </Container>
    );
}

export default Admin;