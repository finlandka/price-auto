import React, { useState, useCallback, useMemo } from 'react';
import { Table, Button, Form, Modal, Alert } from 'react-bootstrap';
//import ReCAPTCHA from "react-google-recaptcha";

function Cart({ cartItems, removeFromCart, updateCartItemQuantity, clearCart }) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
    //const recaptchaRef = useRef();

    const total = useMemo(() => cartItems.reduce((sum, item) => sum + item[4] * item.quantity, 0), [cartItems]);

    const handleQuantityChange = useCallback((index, newQuantity) => {
        if (newQuantity > 0) {
            updateCartItemQuantity(index, newQuantity);
        }
    }, [updateCartItemQuantity]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmitOrder = useCallback(async (e) => {
        e.preventDefault();
        setAlert({ show: false, variant: '', message: '' });

        /*const recaptchaValue = recaptchaRef.current.getValue();
        if (!recaptchaValue) {
            setAlert({ show: true, variant: 'danger', message: 'Пожалуйста, пройдите проверку reCAPTCHA' });
            return;
        }*/

        const orderData = {
            ...formData,
            items: cartItems,
            total,
            //recaptchaToken: recaptchaValue
        };

        try {
            const response = await fetch('/api/submit-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (response.ok) {
                setAlert({ show: true, variant: 'success', message: 'Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.' });
                clearCart();
                setShowModal(false);
            } else {
                const errorMessage = data.errors
                    ? data.errors.map(err => err.msg).join(', ')
                    : data.message || 'Произошла ошибка при оформлении заказа';
                setAlert({ show: true, variant: 'danger', message: errorMessage });
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            setAlert({ show: true, variant: 'danger', message: 'Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.' });
        } /*finally {
            //recaptchaRef.current.reset();
        }*/
    }, [formData, cartItems, total, clearCart]);

    const renderTableRow = useCallback((item, index) => (
        <tr key={index}>
            <td>{item[0]}</td>
            <td>{item[1]}</td>
            <td>{item[2]}</td>
            <td>
                <Form.Control
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    style={{ width: '70px' }}
                />
            </td>
            <td>{item[4]}</td>
            <td>{item[4] * item.quantity} &#8381;</td>
            <td>
                <Button variant="danger" onClick={() => removeFromCart(index)}>
                    Удалить
                </Button>
            </td>
        </tr>
    ), [handleQuantityChange, removeFromCart]);

    return (
        <div>
            <h2>Корзина</h2>
            <Table responsive="md" striped hover>
                <thead>
                <tr>
                    <th>Бренд</th>
                    <th>Артикул</th>
                    <th>Наименование</th>
                    <th>Количество</th>
                    <th>Цена</th>
                    <th>Сумма</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {cartItems.map(renderTableRow)}
                </tbody>
            </Table>
            <h3 className='mb-4'>Итого: {total} &#8381;</h3>
            <Button variant="primary" onClick={() => setShowModal(true)}>
                Оформить заказ
            </Button>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Оформление заказа</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {alert.show && (
                        <Alert variant={alert.variant} onClose={() => setAlert(prev => ({ ...prev, show: false }))} dismissible>
                            {alert.message}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmitOrder}>
                        <Form.Group className='mb-2'>
                            <Form.Label>Имя</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className='mb-2'>
                            <Form.Label>Электронная почта</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className='mb-2'>
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        ))}
                        {/*<ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey="YOUR_RECAPTCHA_SITE_KEY"
                            className="mb-3"
                        />*/}
                        <Form.Group className='mt-4'>
                            <Button variant="primary" type="submit">
                                Подтвердить заказ
                            </Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>

            {alert.show && !showModal && (
                <Alert variant={alert.variant} className="mt-3" onClose={() => setAlert(prev => ({ ...prev, show: false }))} dismissible>
                    {alert.message}
                </Alert>
            )}
        </div>
    );
}

export default Cart;