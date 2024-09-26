import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BoatList from './components/BoatList';
import BoatForm from './components/BoatForm';
import AreYouSure from './components/AreYouSure';
import Header from './components/Header';
import './App.css';

function App() {
  const [boats, setBoats] = useState([]); // All boats fetched from the backend
  const [filteredBoats, setFilteredBoats] = useState([]); // Boats displayed after filtering or search
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [boatsPerPage] = useState(10); // Number of boats per page
  const [totalPages, setTotalPages] = useState(1); // Total pages available
  const [selectedBoat, setSelectedBoat] = useState(null); // Boat selected for editing or viewing
  const [showForm, setShowForm] = useState(false); // Show or hide boat form modal
  const [showConfirmation, setShowConfirmation] = useState(false); // Show or hide delete confirmation modal
  const [deleteBoatId, setDeleteBoatId] = useState(null); // ID of the boat to be deleted

  const API_URL = 'http://localhost:5000/boats'; // Base URL for the API

  useEffect(() => {
    fetchAllBoats();
  }, []);

  // Fetch all boats from the backend and set pagination details
  const fetchAllBoats = () => {
    axios.get(API_URL)
      .then(response => {
        const boatData = response.data.boats || [];
        setBoats(boatData);
        setFilteredBoats(boatData); // Initially display all boats
        setTotalPages(Math.ceil(boatData.length / boatsPerPage)); // Calculate total pages
      })
      .catch(error => console.error('Error fetching boats:', error));
  };

  // Delete a boat by ID
  const handleDelete = (id) => {
    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        const updatedBoats = boats.filter(boat => boat.id !== id);
        setBoats(updatedBoats);
        setFilteredBoats(updatedBoats); // Update filtered list as well
        setShowConfirmation(false);
        updateTotalPages(updatedBoats); // Update total pages after deletion
      })
      .catch(error => console.error('Error deleting boat:', error));
  };

  // Update total pages based on the filtered boat list
  const updateTotalPages = (filteredBoatsList) => {
    setTotalPages(Math.ceil(filteredBoatsList.length / boatsPerPage));
  };

  // Handle pagination changes
  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Open the form modal for adding or editing a boat
  const openForm = (boat = null) => {
    setSelectedBoat(boat);
    setShowForm(true);
  };

  // Close the form modal
  const closeForm = () => {
    setSelectedBoat(null);
    setShowForm(false);
  };

  // Open the confirmation modal for deleting a boat
  const confirmDelete = (id) => {
    setDeleteBoatId(id);
    setShowConfirmation(true);
  };

  // Handle saving a new or edited boat
  const handleSave = (boat) => {
    if (boat.id) {
      // Update existing boat
      axios.put(`${API_URL}/${boat.id}`, boat)
        .then(() => {
          fetchAllBoats(); // Re-fetch all boats to reflect changes
          closeForm();
        })
        .catch(error => console.error('Error updating boat:', error));
    } else {
      // Create new boat
      axios.post(API_URL, boat)
        .then(() => {
          fetchAllBoats(); // Re-fetch all boats to reflect changes
          closeForm();
        })
        .catch(error => console.error('Error creating boat:', error));
    }
  };

  // Handle searching boats based on index or text
  const handleSearch = ({ type, value }) => {
    let filtered = boats;

    if (type === 'index') {
      // If searching by index, filter by exact match
      filtered = boats.filter(boat => boat.index === parseInt(value));
    } else if (type === 'text') {
      // If searching by text, search all fields
      const lowerTerm = value.toLowerCase();
      filtered = boats.filter(boat => {
        return (
          (boat.name && boat.name.toLowerCase().includes(lowerTerm)) ||
          (boat.customer_name && boat.customer_name.toLowerCase().includes(lowerTerm)) ||
          (boat.size && boat.size.toString().includes(value)) ||
          (boat.make_model && boat.make_model.toLowerCase().includes(lowerTerm)) ||
          (boat.vehicle_type && boat.vehicle_type.toLowerCase().includes(lowerTerm))
        );
      });
    }

    setFilteredBoats(filtered);
    setCurrentPage(1); // Reset to the first page when a new search is applied
    updateTotalPages(filtered); // Update total pages based on filtered results
  };

  // Clear search results and show all boats
  const handleClearSearch = () => {
    setFilteredBoats(boats); // Reset to all boats
    setCurrentPage(1); // Reset to the first page
    updateTotalPages(boats); // Update total pages to original state
  };

  // Get current boats based on pagination
  const currentBoats = filteredBoats.slice(
    (currentPage - 1) * boatsPerPage,
    currentPage * boatsPerPage
  );

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
            <span style={{ margin: '0 10px' }}>
              You're on page {currentPage} of {totalPages === 0 ? 1 : totalPages}
            </span>
            <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>{'->'}</button>
          </div>
          <BoatList 
            boats={currentBoats} // Show only the boats for the current page
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
