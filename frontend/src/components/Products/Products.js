import React, { useState, useEffect } from 'react';
import './Products.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

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

    const handleQuantityChange = (index, value) => {
        setQuantities(prev => ({ ...prev, [index]: value }));
    };

    const handleAddToCart = (product, index) => {
        const quantity = quantities[index] || 1;
        addToCart({ ...product, quantity: parseInt(quantity) });
        setAddedToCart(prev => ({ ...prev, [product[1]]: true }));
    };

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
                {(searchResults && searchResults.length > 0) ? (
                    searchResults.map((product, index) => (
                        <tr key={index}>
                            <td>{product[0]}</td>
                            <td>{product[1]}</td>
                            <td>{product[2]}</td>
                            <td>
                                <div className="d-flex justify-content-center align-items-center" style={{height: '100%'}}>
                                    {product[3]}
                                </div>
                            </td>
                            <td>
                                <div className="d-flex justify-content-center align-items-center" style={{height: '100%'}}>
                                    {product[4]} &#8381;
                                </div>
                            </td>
                            <td><div className="d-flex justify-content-center align-items-center" style={{height: '100%'}}>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={quantities[index] || 1}
                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    style={{ width: '70px' }}
                                /></div>
                            </td>
                            <td>
                                <div className="d-flex justify-content-center align-items-center" style={{height: '100%'}}>
                                <Button
                                    variant={addedToCart[product[1]] ? "success" : "primary"}
                                    onClick={() => handleAddToCart(product, index)}
                                    disabled={addedToCart[product[1]]}
                                >
                                    {addedToCart[product[1]] ? "✔" : "+"}
                                </Button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7">Ничего не нашли? Напишите <a href='https://web.whatsapp.com/' target='_blank'>нам</a></td>
                    </tr>
                )}
                </tbody>
            </Table>
        </section>
    );
}

export default Products;