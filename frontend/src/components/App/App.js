import './App.css';
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Button, Tab, Tabs, ListGroup } from 'react-bootstrap';
import * as MainApi from "../../mainApi";
import { CurrentUserContext } from '../../context/CurrentUserContext';
import { LoggedInContext } from '../../context/LoggedInContext';
import ProtectedAuthRouteElement from '../ProtectedAuthRoute/ProtectedAuthRoute';
import ProtectedRouteElement from '../ProtectedRoute/ProtectedRoute';
import Header from '../Header/Header';
import Search from '../Search/Search';
import Products from "../Products/Products";
import Login from "../Login/Login";
import Admin from "../Admin/Admin";
import Cart from "../Cart/Cart";
import PriceListsView from "../PriceListsView/PriceListsView";

function App() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [loginError, setLoginError] = useState('');
    const [currentUser, setCurrentUser] = useState({});
    const [loggedIn, setLoggedIn] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [showCart, setShowCart] = useState(false);

    const mainApi = useMemo(() => new MainApi({baseUrl: process.env.REACT_APP_URL}), []);

    const resetLoginError = useCallback(() => {
        setLoginError('');
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const savedUser = JSON.parse(localStorage.getItem("currentUser"));
            mainApi.getToken(token)
                .then((result) => {
                    if (result) {
                        setLoggedIn(true);
                        setCurrentUser(savedUser);
                    }
                })
                .catch(error => console.error('An error occurred:', error))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [mainApi]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const onLogin = useCallback((email, password) => {
        return mainApi.authorization(email, password)
            .then((result) => {
                setLoggedIn(true);
                localStorage.setItem('token', result.token);
                getUser();
                navigate("/admin", { replace: true });
            })
            .catch(setLoginError);
    }, [mainApi, navigate]);

    const onLogout = useCallback(() => {
        setLoggedIn(false);
        setCurrentUser({});
        setLoginError('');
        localStorage.clear();
    }, []);

    const getUser = useCallback(() => {
        mainApi.getUserInfo()
            .then((result) => {
                setCurrentUser(result);
                localStorage.setItem('currentUser', JSON.stringify(result));
            })
            .catch(error => console.error('An error occurred:', error));
    }, [mainApi]);

    const handleSearchResult = useCallback((results) => {
        setSearchResults(results);
    }, []);

    const addToCart = useCallback((product) => {
        setCart(prevCart => {
            const existingProduct = prevCart.find(item => item[1] === product[1]);
            if (existingProduct) {
                return prevCart.map(item =>
                    item[1] === product[1]
                        ? {...item, quantity: item.quantity + (product.quantity || 1)}
                        : item
                );
            } else {
                return [...prevCart, {...product, quantity: product.quantity || 1}];
            }
        });
    }, []);

    const removeFromCart = useCallback((index) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== index));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const updateCartItemQuantity = useCallback((index, newQuantity) => {
        setCart(prevCart =>
            prevCart.map((item, i) =>
                i === index ? {...item, quantity: newQuantity} : item
            )
        );
    }, []);

    const toggleCart = useCallback(() => {
        setShowCart(prev => !prev);
    }, []);

    const contextValue = useMemo(() => ({ loggedIn, loading }), [loggedIn, loading]);

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <LoggedInContext.Provider value={contextValue}>
                <div className="page">
                    <Header />
                    <div className="d-flex justify-content-end mb-3">
                        <Button onClick={toggleCart}>
                            {showCart ? 'Вернуться к товарам' : `Корзина (${cart.length})`}
                        </Button>
                    </div>

                    <Routes>
                        <Route path="/" element={
                            showCart ? (
                                <Cart
                                    cartItems={cart}
                                    removeFromCart={removeFromCart}
                                    updateCartItemQuantity={updateCartItemQuantity}
                                    clearCart={clearCart}
                                />
                            ) : (
                                <Tabs defaultActiveKey="search" className="mb-3">
                                    <Tab eventKey="search" title="Поиск">
                                        <Search onSearchResult={handleSearchResult} />
                                        <Products searchResults={searchResults} addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} />
                                    </Tab>
                                    <Tab eventKey="all-price-lists" title="Все прайс-листы">
                                        <PriceListsView loggedIn={loggedIn} />
                                    </Tab>
                                    <Tab eventKey="additional-services" title="Дополнительные услуги">
                                        <ListGroup>
                                            <ListGroup.Item>Автоподбор</ListGroup.Item>
                                            <ListGroup.Item>Вскрытие авто (техническая помощь)</ListGroup.Item>
                                            <ListGroup.Item>Автострахование (в любой страховой компании)</ListGroup.Item>
                                            <ListGroup.Item>Диагностическая карта</ListGroup.Item>
                                            <ListGroup.Item>Привоз машин из-за рубежа</ListGroup.Item>
                                            <ListGroup.Item>Эвакуатор</ListGroup.Item>
                                        </ListGroup>
                                    </Tab>
                                </Tabs>
                            )
                        }/>
                        <Route path="/login" element={
                            <ProtectedAuthRouteElement
                                element={
                                    <Login
                                        onLogin={onLogin}
                                        loginError={loginError}
                                        resetLoginError={resetLoginError}
                                    />
                                }
                            />
                        }/>
                        <Route path="/admin" element={
                            <ProtectedRouteElement
                                element={<Admin onLogout={onLogout} loggedIn={loggedIn} />}
                            />
                        }/>
                    </Routes>
                </div>
            </LoggedInContext.Provider>
        </CurrentUserContext.Provider>
    );
}

export default App;