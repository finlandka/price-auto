import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Form, InputGroup, Button } from 'react-bootstrap';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_URL}/api/searchProduct`;

function Search({ onSearchResult }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;

        try {
            const { data } = await axios.get(`${API_URL}?query=${encodeURIComponent(searchQuery)}`);
            onSearchResult(data.products);
        } catch (error) {
            console.error('Error searching for products:', error);
            onSearchResult([]);
        }
    }, [searchQuery, onSearchResult]);

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    const handleClear = useCallback(() => {
        setSearchQuery('');
        onSearchResult([]);
    }, [onSearchResult]);

    const handleChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    return (
        <section>
            <InputGroup>
                <Form.Control
                    type="text"
                    id="inputSearch"
                    placeholder="Введите артикул или наименование"
                    value={searchQuery}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    aria-label="Поиск продукта"
                />
                <Button variant="primary" onClick={handleSearch}>
                    Найти
                </Button>
                <Button variant="secondary" onClick={handleClear} aria-label="Очистить поиск">
                    ✘
                </Button>
            </InputGroup>
        </section>
    );
}

Search.propTypes = {
    onSearchResult: PropTypes.func.isRequired,
};

export default Search;