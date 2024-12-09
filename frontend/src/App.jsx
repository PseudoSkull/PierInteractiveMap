// ./App.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BoatList from './components/BoatList';
import BoatForm from './components/BoatForm';
import AreYouSure from './components/AreYouSure';
import Header from './components/Header';
import Map from './components/Map'; // Import the new Map component
import './styles/App.css';

function App() {
  const [boats, setBoats] = useState([]); // All boats (for the list) fetched from the backend
  const [filteredBoats, setFilteredBoats] = useState([]); // Boats displayed after filtering or search
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [boatsPerPage] = useState(10); // Number of boats per page
  const [totalPages, setTotalPages] = useState(1); // Total pages available
  const [selectedBoat, setSelectedBoat] = useState(null); // Boat selected for editing or viewing
  const [showForm, setShowForm] = useState(false); // Show or hide boat form modal
  const [deleteBoatId, setDeleteBoatId] = useState(null); // ID of the boat to be deleted

  // Map-related
  const [boatsOnMap, setBoatsOnMap] = useState([]); // All boats (for the map) fetched from the backend
  const [activeBoatOnMapId, setActiveBoatOnMapId] = useState(null);
  
  const [showConfirmation, setShowConfirmation] = useState(false); // Show or hide delete confirmation modal

  const API_URL = 'http://localhost:5000/boats'; // Base URL for the API

  useEffect(() => {
    fetchAllBoats();
  }, []);

  const fetchAllBoats = () => {
    axios.get(API_URL)
      .then(response => {
        const boatData = response.data.boats || [];
        setBoats(boatData);
        setFilteredBoats(boatData);
        setTotalPages(Math.ceil(boatData.length / boatsPerPage));
      })
      .catch(error => console.error('Error fetching boats:', error));
  };

  const handleDelete = (id) => {
    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        const updatedBoats = boats.filter(boat => boat.id !== id);
        setBoats(updatedBoats);
        setFilteredBoats(updatedBoats);
        setShowConfirmation(false);
        updateTotalPages(updatedBoats);
      })
      .catch(error => console.error('Error deleting boat:', error));
  };

  const updateTotalPages = (filteredBoatsList) => {
    setTotalPages(Math.ceil(filteredBoatsList.length / boatsPerPage));
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
      axios.put(`${API_URL}/${boat.id}`, boat)
        .then(() => {
          fetchAllBoats();
          closeForm();
        })
        .catch(error => console.error('Error updating boat:', error));
    } else {
      axios.post(API_URL, boat)
        .then(() => {
          fetchAllBoats();
          closeForm();
        })
        .catch(error => console.error('Error creating boat:', error));
    }
  };

  const handleSearch = ({ type, value }) => {
    let filtered = boats;

    if (type === 'index') {
      filtered = boats.filter(boat => boat.index === parseInt(value));
    } else if (type === 'text') {
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
    setCurrentPage(1);
    updateTotalPages(filtered);
  };

  const clearAllBoatData = () => {
    axios.delete('http://localhost:5000/boats-on-map/clear')
      .then(() => {
        setShapes([{ id: 1, x: 200, y: 200, width: 100, height: 50, color: 'purple', angle: 0 }]);
      })
      .catch(error => console.error('Error clearing boats:', error));
  };
  

  const handleClearSearch = () => {
    setFilteredBoats(boats);
    setCurrentPage(1);
    updateTotalPages(boats);
  };

  const fetchBoatsOnMap = () => {
    axios.get('http://localhost:5000/boats-on-map')
      .then(response => setBoatsOnMap(response.data.boats_on_map))
      .catch(error => console.error('Error loading boats-on-map data:', error));
  };
  
  useEffect(() => {
    fetchBoatsOnMap();
  }, []);

  const saveBoatOnMap = (updatedShape) => {
    axios.put(`http://localhost:5000/boats-on-map/${updatedShape.id}`, updatedShape)
      .then(() => console.log('BoatOnMap updated successfully'))
      .catch(error => console.error('Error saving boat-on-map data:', error));
  };

  const currentBoats = filteredBoats.slice(
    (currentPage - 1) * boatsPerPage,
    currentPage * boatsPerPage
  );

  return (
    <div className="app">
      <Header onSearch={handleSearch} onClear={handleClearSearch} />
      <div className="container">
        <div className="map-section">
          <Map
            boatsOnMap={boatsOnMap}
            setBoatsOnMap={setBoatsOnMap}
            saveBoatOnMap={saveBoatOnMap}
            activeBoatOnMapId={activeBoatOnMapId}
            setActiveBoatOnMapId={setActiveBoatOnMapId}
          />
        </div>
        <div className="listing-section">
          <h2>Boat Listings</h2>
          <button onClick={() => openForm()}>+ Add Boat</button>
          <div className="pagination">
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>{'<-'}</button>
            <span>
              You're on page {currentPage} of {totalPages}
            </span>
            <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>{'->'}</button>
          </div>
          <BoatList
            boats={currentBoats}
            onEdit={openForm}
            onDelete={confirmDelete}
          />
        </div>
      </div>
      {showForm && (
        <BoatForm boat={selectedBoat} onSave={handleSave} onClose={closeForm} />
      )}
      {showConfirmation && (
        <AreYouSure
          message="Are you sure you want to delete this boat?"
          onYes={() => handleDelete(deleteBoatId)}
          onNo={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}

export default App;
