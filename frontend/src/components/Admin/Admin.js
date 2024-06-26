import React from 'react';
import ExcelReader from '../ExcelReader/ExcelReader';
import PriceListsView from '../PriceListsView/PriceListsView';
import { Button, Container, Row, Col } from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

function Admin({ onLogout, loggedIn }) {
    const [shouldRefetch, setShouldRefetch] = React.useState(false);

    const handlePriceListAdded = () => {
        setShouldRefetch(true);
    };

    return (
        <>
            <h2>Админ-панель</h2>
            <Tabs
                defaultActiveKey="price-lists"
                className="mb-3"
            >
                <Tab eventKey="price-lists" title="Прайс-листы">
                    <PriceListsView loggedIn={loggedIn} shouldRefetch={shouldRefetch} setShouldRefetch={setShouldRefetch} />
                </Tab>
                <Tab eventKey="add" title="Добавить">
                    <ExcelReader onPriceListAdded={handlePriceListAdded} />
                </Tab>
                <Tab eventKey="logout" title="Выйти">
                    <Container>
                        <Row className="justify-content-center">
                            <Col xs="auto">
                                <Button variant="primary" onClick={onLogout}>
                                    Выйти
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </Tab>
            </Tabs>
        </>
    )
}

export default Admin;