import './login.css';
import React, { useCallback, useState } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function Login({onLogin, loginError, resetLoginError}) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        return () => {
            resetLoginError();
        };
    }, [resetLoginError]);

    const handleChangeEmail = useCallback(e => {
        setEmail(e.target.value);
        const isValid = e.target.validity.valid;
        setEmailError(isValid ? '' : e.target.validationMessage);
    }, [])

    const handleChangePassword = useCallback(e => {
        setPassword(e.target.value);
        const isValid = e.target.validity.valid;
        setPasswordError(isValid ? '' : e.target.validationMessage);
    }, [])

    const handleSubmit = useCallback(e => {
        e.preventDefault();
        if (emailError || passwordError) {
            return;
        }
        setIsLoading(true);
        onLogin(email, password)
            .finally(() => setIsLoading(false));
    }, [email, password, emailError, passwordError, onLogin])

    const isFormValid = !emailError && !passwordError && email && password;

    return (
        <div className="login">
            <h2 className='login__title'>Авторизация</h2>
            <Form onSubmit={handleSubmit} className='login__form'>
                <Form.Group controlId="formGroupEmail">
                <Form.Control
                    id="loginEmail"
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={handleChangeEmail}
                    pattern="[\w-]+@[\w-]*\.[a-z]*"
                    disabled={isLoading}
                />
                <p className="login__error">{emailError}</p>
                </Form.Group>
                <Form.Group controlId="formGroupPassword">
                <Form.Control
                    id="loginPassword"
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
                <p className="login__error">{passwordError}</p>
                </Form.Group>
                <p className="login__error">{loginError}</p>
                <Button type="submit" variant="primary" disabled={!isFormValid}>
                    Войти
                </Button>
            </Form>
        </div>
    );
}

export default Login;