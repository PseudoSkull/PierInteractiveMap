import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BoatList from './components/BoatList';
import BoatForm from './components/BoatForm';
import AreYouSure from './components/AreYouSure';
import Header from './components/Header'; // Import Header component
import './App.css';

function App() {
  const [boats, setBoats] = useState([]); // Initialize as an empty array
  const [filteredBoats, setFilteredBoats] = useState([]); // For search results
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteBoatId, setDeleteBoatId] = useState(null);

  const API_URL = 'http://localhost:5000/boats'; // Base URL for the API

  useEffect(() => {
    fetchBoats(currentPage);
  }, [currentPage]);

  const fetchBoats = (page) => {
    axios.get(`${API_URL}?page=${page}&per_page=10`) // Include the per_page parameter
      .then(response => {
        const boatData = response.data.boats || [];
        setBoats(boatData);
        setFilteredBoats(boatData); // Set filtered boats to the same initially
        setTotalPages(response.data.pages || 1); // Set default value if undefined
      })
      .catch(error => console.error('Error fetching boats:', error));
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        const updatedBoats = boats.filter(boat => boat.id !== id);
        setBoats(updatedBoats);
        setFilteredBoats(updatedBoats); // Update filtered list as well
        setShowConfirmation(false);
      })
      .catch(error => console.error('Error deleting boat:', error));
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const openForm = (boat = null) => {
    setSelectedBoat(boat);
    setShowForm(true);
  };

  const closeForm = () => {
    setSelectedBoat(null);
    setShowForm(false);
  };

  const confirmDelete = (id) => {
    setDeleteBoatId(id);
    setShowConfirmation(true);
  };

  const handleSave = (boat) => {
    if (boat.id) {
      // Update existing boat
      axios.put(`${API_URL}/${boat.id}`, boat)
        .then(() => {
          fetchBoats(currentPage);
          closeForm();
        })
        .catch(error => console.error('Error updating boat:', error));
    } else {
      // Create new boat
      axios.post(API_URL, boat)
        .then(() => {
          fetchBoats(currentPage);
          closeForm();
        })
        .catch(error => console.error('Error creating boat:', error));
    }
  };

  // Search Function
  const handleSearch = (term) => {
    if (!term) return;
    
    const lowerTerm = term.toLowerCase();
    const filtered = boats.filter(boat => {
      return (
        (boat.index && boat.index.toString().includes(term)) ||
        (boat.name && boat.name.toLowerCase().includes(lowerTerm)) ||
        (boat.customer_name && boat.customer_name.toLowerCase().includes(lowerTerm)) ||
        (boat.size && boat.size.toString().includes(term)) ||
        (boat.make_model && boat.make_model.toLowerCase().includes(lowerTerm))
      );
    });
    setFilteredBoats(filtered);
  };

  // Clear Search
  const handleClearSearch = () => {
    setFilteredBoats(boats); // Reset to all boats
  };

  return (
    <div>
      <Header onSearch={handleSearch} onClear={handleClearSearch} /> {/* Header is now outside the container */}
      <div className="container">
        <div className="map-section">
          <img src="/map_for_inkscape.svg" alt="Map of the marina" />
        </div>
        <div className="listing-section">
          <h2>Boat Listings</h2>
          <button onClick={() => openForm()}>+ Add Boat</button>
          <div className="pagination">
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>{'<-'}</button>
            <span style={{ margin: '0 10px' }}>You're on page {currentPage}</span>
            <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>{'->'}</button>
          </div>
          <BoatList 
            boats={filteredBoats} // Use filtered boats for the list
            onEdit={openForm}
            onDelete={confirmDelete}
          />
        </div>
      </div>
      {showForm && 
        <BoatForm 
          boat={selectedBoat}
          onSave={handleSave}
          onClose={closeForm}
        />
      }
      {showConfirmation &&
        <AreYouSure
          message="Are you sure you want to delete this boat?"
          onYes={() => handleDelete(deleteBoatId)}
          onNo={() => setShowConfirmation(false)}
        />
      }
    </div>
  );
}

export default App;
