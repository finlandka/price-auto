import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

function ChangePassword({ onPasswordChange }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Новый пароль и подтверждение не совпадают');
            return;
        }

        try {
            await onPasswordChange(currentPassword, newPassword);
            setSuccess('Пароль успешно изменен');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Произошла ошибка при смене пароля');
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className='mb-2'>
                <Form.Label>Текущий пароль</Form.Label>
                <Form.Control
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group className='mb-2'>
                <Form.Label>Новый пароль</Form.Label>
                <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group className='mb-4'>
                <Form.Label>Подтвердите новый пароль</Form.Label>
                <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Button type="submit">Изменить пароль</Button>
        </Form>
    );
}

export default ChangePassword;