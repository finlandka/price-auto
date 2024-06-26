import React, { useState, useRef } from 'react';
import { Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import HCaptcha from '@hcaptcha/react-hcaptcha';

function Cart({ cartItems, removeFromCart, updateCartItemQuantity }) {
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [captchaToken, setCaptchaToken] = useState(null);
    const captchaRef = useRef(null);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });

    const total = cartItems.reduce((sum, item) => sum + item[4] * item.quantity, 0);

    const handleQuantityChange = (index, newQuantity) => {
        if (newQuantity > 0) {
            updateCartItemQuantity(index, newQuantity);
        }
    };

    const handleVerificationSuccess = (token) => {
        setCaptchaToken(token);
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setAlert({ show: false, variant: '', message: '' });

        if (!captchaToken) {
            setAlert({ show: true, variant: 'danger', message: 'Пожалуйста, подтвердите, что вы не робот' });
            return;
        }

        const orderData = {
            name,
            email,
            phone,
            items: cartItems,
            total,
            captchaToken
        };

        try {
            const response = await fetch('/api/submit-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (response.ok) {
                setAlert({ show: true, variant: 'success', message: 'Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.' });
                // Очистить корзину после успешного заказа
                cartItems.forEach((_, index) => removeFromCart(index));
                setShowModal(false);
            } else {
                if (data.errors) {
                    // Обработка ошибок валидации
                    const errorMessages = data.errors.map(err => err.msg).join(', ');
                    setAlert({ show: true, variant: 'danger', message: errorMessages });
                } else {
                    setAlert({ show: true, variant: 'danger', message: data.message || 'Произошла ошибка при оформлении заказа' });
                }
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            setAlert({ show: true, variant: 'danger', message: 'Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.' });
        }
        captchaRef.current.resetCaptcha();
        setCaptchaToken(null);
    };

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
                {cartItems.map((item, index) => (
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
                        <td>{item[4] * item.quantity}</td>
                        <td>
                            <Button variant="danger" onClick={() => removeFromCart(index)}>
                                Удалить
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <h3 className='mb-4'>Итого: {total}</h3>
            <Button variant="primary" onClick={() => setShowModal(true)}>
                Оформить заказ
            </Button>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Оформление заказа</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {alert.show && (
                        <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
                            {alert.message}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmitOrder}>
                        <Form.Group className='mb-2'>
                            <Form.Label>Имя</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className='mb-2'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className='mb-4'>
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className='mb-4'>
                            <HCaptcha
                                sitekey="acc4d9d0-0a36-492c-914a-1cd6f6b47c7e"
                                onVerify={handleVerificationSuccess}
                                ref={captchaRef}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Button variant="primary" type="submit">
                                Подтвердить заказ
                            </Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>

            {alert.show && !showModal && (
                <Alert variant={alert.variant} className="mt-3" onClose={() => setAlert({ ...alert, show: false })} dismissible>
                    {alert.message}
                </Alert>
            )}
        </div>
    );
}

export default Cart;