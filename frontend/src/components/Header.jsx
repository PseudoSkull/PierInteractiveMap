// ./components/Header.jsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function Header({ onSearch, onClear }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If the search bar is cleared, reset the search results
    if (value === '') {
      onClear();
    }
  };

  const handleSearch = () => {
    // Check if the searchTerm is a number and contains no other characters
    if (/^\d+$/.test(searchTerm.trim())) {
      onSearch({ type: 'index', value: parseInt(searchTerm.trim(), 10) });
    } else {
      onSearch({ type: 'text', value: searchTerm.trim() });
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onClear();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="header-container">
      <FontAwesomeIcon icon={faSearch} style={{ marginRight: '10px' }} />
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        placeholder="Search by index, name, customer, size, or type"
        className="header-input"
      />
      <button onClick={handleSearch} className="header-button">Search</button>
      <button onClick={handleClear} className="header-button">Clear Search</button>
    </div>
  );
}

export default Header;
