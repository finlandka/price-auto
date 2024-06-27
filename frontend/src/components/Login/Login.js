import React, { useCallback, useState, useEffect } from "react";
import { Form, Button } from 'react-bootstrap';
import './login.css';

function Login({ onLogin, loginError, resetLoginError }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        return resetLoginError;
    }, [resetLoginError]);

    const handleChangeEmail = useCallback((e) => {
        setEmail(e.target.value);
        setEmailError(e.target.validity.valid ? '' : e.target.validationMessage);
    }, []);

    const handleChangePassword = useCallback((e) => {
        setPassword(e.target.value);
        setPasswordError(e.target.validity.valid ? '' : e.target.validationMessage);
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (emailError || passwordError) return;
        setIsLoading(true);
        onLogin(email, password).finally(() => setIsLoading(false));
    }, [email, password, emailError, passwordError, onLogin]);

    const isFormValid = !emailError && !passwordError && email && password;

    return (
        <div className="login">
            <h2 className='login__title'>Авторизация</h2>
            <Form onSubmit={handleSubmit} className='login__form'>
                <Form.Group controlId="loginEmail" className='mb-2'>
                    <Form.Control
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={handleChangeEmail}
                        pattern="[\w-]+@[\w-]*\.[a-z]*"
                        disabled={isLoading}
                    />
                    {emailError && <p className="login__error">{emailError}</p>}
                </Form.Group>
                <Form.Group controlId="loginPassword"  className='mb-2'>
                    <Form.Control
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        required
                        minLength="5"
                        maxLength="15"
                        value={password}
                        onChange={handleChangePassword}
                        disabled={isLoading}
                    />
                    {passwordError && <p className="login__error">{passwordError}</p>}
                </Form.Group>
                {loginError && <p className="login__error">{loginError}</p>}
                <Button type="submit" variant="primary" disabled={!isFormValid || isLoading}>
                    {isLoading ? 'Вход...' : 'Войти'}
                </Button>
            </Form>
        </div>
    );
}

export default Login;