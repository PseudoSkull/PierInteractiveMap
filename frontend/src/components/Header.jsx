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
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f8f9fa' }}>
      <FontAwesomeIcon icon={faSearch} style={{ marginRight: '10px' }} />
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        placeholder="Search by index, name, customer, size, or type"
        style={{ flex: 1, padding: '10px', marginRight: '10px' }}
      />
      <button onClick={handleSearch} style={{ padding: '10px 20px', marginRight: '10px' }}>Search</button>
      <button onClick={handleClear} style={{ padding: '10px 20px' }}>Clear Search</button>
    </div>
  );
}

export default Header;
