import React, { useCallback } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoClick = useCallback((e) => {
        e.preventDefault();
        if (location.pathname === '/') {
            window.location.reload();
        } else {
            navigate('/');
        }
    }, [location.pathname, navigate]);

    return (
        <header className='header'>
            <Link
                onClick={handleLogoClick}
                className="header__logo"
                to="/"
                title="Автозапчасти ООО Астра"
                aria-label="На главную страницу"
            />
        </header>
    );
}

export default Header;