import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import './Products.css';

function Products({ searchResults, addToCart, cart }) {
    const [quantities, setQuantities] = useState({});
    const [addedToCart, setAddedToCart] = useState({});

    useEffect(() => {
        const cartMap = cart.reduce((acc, item) => {
            acc[item[1]] = true;
            return acc;
        }, {});
        setAddedToCart(cartMap);
    }, [cart]);

    const handleQuantityChange = useCallback((index, value) => {
        setQuantities(prev => ({ ...prev, [index]: value }));
    }, []);

    const handleAddToCart = useCallback((product, index) => {
        const quantity = quantities[index] || 1;
        addToCart({ ...product, quantity: parseInt(quantity, 10) });
        setAddedToCart(prev => ({ ...prev, [product[1]]: true }));
    }, [quantities, addToCart]);

    const renderTableCell = useCallback((content, center = true) => (
        <td>
            <div className={`d-flex ${center ? 'justify-content-center' : ''} align-items-center h-100`}>
                {content}
            </div>
        </td>
    ), []);

    const renderProductRow = useCallback((product, index) => (
        <tr key={index}>
            <td>{product[0]}</td>
            <td>{product[1]}</td>
            <td>{product[2]}</td>
            {renderTableCell(product[3])}
            {renderTableCell(`${product[4]} ₽`)}
            {renderTableCell(
                <Form.Control
                    type="number"
                    min="1"
                    value={quantities[index] || 1}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    style={{ width: '70px' }}
                />
            )}
            {renderTableCell(
                <Button
                    variant={addedToCart[product[1]] ? "success" : "primary"}
                    onClick={() => handleAddToCart(product, index)}
                    disabled={addedToCart[product[1]]}
                >
                    {addedToCart[product[1]] ? "✔" : "+"}
                </Button>
            )}
        </tr>
    ), [quantities, addedToCart, handleQuantityChange, handleAddToCart, renderTableCell]);

    return (
        <section className='products'>
            <Table responsive striped hover>
                <thead>
                <tr>
                    <th>Бренд</th>
                    <th>Артикул</th>
                    <th>Наименование</th>
                    <th className="text-center">Наличие</th>
                    <th className="text-center">Цена</th>
                    <th className="text-center">Кол-во</th>
                    <th className="text-center">Действия</th>
                </tr>
                </thead>
                <tbody>
                {searchResults && searchResults.length > 0 ? (
                    searchResults.map(renderProductRow)
                ) : (
                    <tr>
                        <td colSpan="7">Ничего не нашли? Напишите <a href='https://web.whatsapp.com/' target='_blank' rel="noopener noreferrer">нам</a></td>
                    </tr>
                )}
                </tbody>
            </Table>
        </section>
    );
}

export default Products;