import './App.css';
import React, {useEffect, useState, useCallback} from "react";
import {Routes, Route, useNavigate} from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import * as MainApi from "../../mainApi";

import {CurrentUserContext} from '../../context/CurrentUserContext';
import {LoggedInContext} from '../../context/LoggedInContext';
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
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [showCart, setShowCart] = useState(false);

    const mainApi = new MainApi({baseUrl: 'http://localhost:3000'})

    const resetLoginError = React.useCallback(() => {
        setLoginError('');
    }, []);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            const token = localStorage.getItem("token");
            const savedUser = JSON.parse(localStorage.getItem("currentUser"));
            mainApi.getToken(token)
                .then((result) => {
                    if (result) {
                        setLoggedIn(true);
                        setCurrentUser(savedUser);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setError(error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    function onLogin(email, password) {
        return mainApi.authorization(email, password)
            .then((result) => {
                setLoggedIn(true);
                localStorage.setItem('token', result.token);
                getUser();
                navigate("/admin", { replace: true });
            })
            .catch(error => {
                setLoginError(error);
            });
    }

    function onLogout() {
        setLoggedIn(false);
        setCurrentUser({});
        setLoginError('');
        localStorage.clear();
    }

    function getUser() {
        mainApi.getUserInfo()
            .then((result) => {
                setCurrentUser(result);
                localStorage.setItem('currentUser', JSON.stringify(result));
            })
            .catch(() => setError(error));
    }

    const handleSearchResult = useCallback((results) => {
        setSearchResults(results);
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
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
    };

    const removeFromCart = (index) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== index));
    };

    const updateCartItemQuantity = (index, newQuantity) => {
        setCart(prevCart =>
            prevCart.map((item, i) =>
                i === index ? {...item, quantity: newQuantity} : item
            )
        );
    };

    const toggleCart = () => {
        setShowCart(!showCart);
    };

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <LoggedInContext.Provider value={{ loggedIn, loading }}>
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
                                />
                            ) : (
                                <>
                                    <Tabs defaultActiveKey="search" className="mb-3">
                                        <Tab eventKey="search" title="Поиск">
                                            <Search onSearchResult={handleSearchResult} />
                                            <Products searchResults={searchResults} addToCart={addToCart} cart={cart} />
                                        </Tab>
                                        <Tab eventKey="all-price-lists" title="Все прайс-листы">
                                            <PriceListsView loggedIn={loggedIn} />
                                        </Tab>
                                    </Tabs>
                                </>
                            )
                        }/>
                        <Route path="/login"
                               element={<ProtectedAuthRouteElement element={<Login onLogin={onLogin} loginError={loginError} resetLoginError={resetLoginError}/>}
                               />}/>
                        <Route path="/admin" element={<ProtectedRouteElement
                            element={<Admin onLogout={onLogout} loggedIn={loggedIn} />}/>}/>
                    </Routes>

                </div>
            </LoggedInContext.Provider>
        </CurrentUserContext.Provider>
    )
}

export default App;