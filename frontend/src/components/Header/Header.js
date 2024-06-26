import './Header.css';
import { Link, useNavigate, useLocation } from "react-router-dom";

function Header() {

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/') {
            window.location.reload();
        } else {
            navigate('/');
        }
    };

    return (
        <div className='header'>
            <Link onClick={handleLogoClick} className="header__logo" to="/" title="Саня АВТО">
            </Link>
        </div>
    )
}

export default Header;