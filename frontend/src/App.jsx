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
  // List-related
  const [boatListings, setBoatListings] = useState([]); // All boats (for the list) fetched from the backend
  const [filteredBoatListings, setFilteredBoatListings] = useState([]); // Boats displayed after filtering or search
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [boatListingsPerPage] = useState(10); // Number of boat listings per page
  const [totalPages, setTotalPages] = useState(1); // Total pages available
  const [selectedBoatListing, setSelectedBoatListing] = useState(null); // Boat selected for editing or viewing
  const [showForm, setShowForm] = useState(false); // Show or hide boat form modal
  const [deleteBoatListingId, setDeleteBoatListingId] = useState(null); // ID of the boat to be deleted

  // Map-related
  const [boatsOnMap, setBoatsOnMap] = useState([]); // All boats (for the map) fetched from the backend
  const [activeBoatOnMapId, setActiveBoatOnMapId] = useState(null);
  const [boatFindMode, setBoatFindMode] = useState(false);
  const [highlightedBoatId, setHighlightedBoatId] = useState(null);
  
  const [showConfirmation, setShowConfirmation] = useState(false); // Show or hide delete confirmation modal

  const API_URL = 'http://localhost:5000/boat_listings'; // Base URL for the boat listing API

  useEffect(() => {
    fetchAllBoatListings();
  }, []);

  const fetchAllBoatListings = () => {
    axios.get(API_URL)
      .then(response => {
        const boatData = response.data.boat_listings || [];
        setBoatListings(boatData);
        setFilteredBoatListings(boatData);
        setTotalPages(Math.ceil(boatData.length / boatListingsPerPage));
      })
      .catch(error => console.error('Error fetching boats:', error));
  };
  

  const handleDelete = (boatListingId) => {
    axios
      .delete(`${API_URL}/${boatListingId}`)
      .then(() => {
        const updatedBoatListings = boatListings.filter(
          (boatListing) => boatListing.boat_listing_id !== boatListingId
        );
        setBoatListings(updatedBoatListings);
        setFilteredBoatListings(updatedBoatListings);
        setShowConfirmation(false); // Close modal after deletion
        updateTotalPages(updatedBoatListings);
      })
      .catch((error) => console.error('Error deleting boat listing:', error));
  };
  

  const updateTotalPages = (filteredBoatListingsList) => {
    setTotalPages(Math.ceil(filteredBoatListingsList.length / boatListingsPerPage));
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const openForm = (boat = null) => {
    setSelectedBoatListing(boat);
    setShowForm(true);
  };

  const closeForm = () => {
    setSelectedBoatListing(null);
    setShowForm(false);
  };

  const confirmDelete = (boatListingId) => {
    const boatToDelete = boatListings.find(
      (boatListing) => boatListing.boat_listing_id === boatListingId
    );
  
    if (!boatToDelete) {
      console.error('Boat listing not found.');
      return;
    }
  
    setShowConfirmation({
      message: `Are you sure you want to delete Boat Listing '${boatToDelete.name || 'Untitled'}'?`,
      onYes: () => handleDelete(boatListingId),
      onNo: () => setShowConfirmation(false),
    });
  };
  

  const handleSave = (boatListing) => {
    const boatListingId = boatListing.boat_listing_id;
    if (boatListingId) {
      axios.put(`${API_URL}/${boatListingId}`, boatListing)
        .then(() => {
          fetchAllBoatListings();
          closeForm();
        })
        .catch(error => console.error('Error updating boat listing:', error));
    } else {
      axios.post(API_URL, boatListing)
        .then(() => {
          fetchAllBoatListings();
          closeForm();
        })
        .catch(error => console.error('Error creating boat listing:', error));
    }
  };

  const handleSearch = ({ type, value }) => {
    let filtered = boatListings;

    if (type === 'index') {
      filtered = boatListings.filter(boatListing => boatListing.index === parseInt(value));
    } else if (type === 'text') {
      const lowerTerm = value.toLowerCase();
      filtered = boatListings.filter(boatListing => {
        return (
          (boatListing.name && boatListing.name.toLowerCase().includes(lowerTerm)) ||
          (boatListing.customer_name && boatListing.customer_name.toLowerCase().includes(lowerTerm)) ||
          (boatListing.size && boatListing.size.toString().includes(value)) ||
          (boatListing.make_model && boatListing.make_model.toLowerCase().includes(lowerTerm)) ||
          (boatListing.vehicle_type && boatListing.vehicle_type.toLowerCase().includes(lowerTerm))
        );
      });
    }

    setFilteredBoatListings(filtered);
    setCurrentPage(1);
    updateTotalPages(filtered);
  };

  const clearAllBoatData = () => {
    axios.delete('http://localhost:5000/boats-on-map/clear')
      .then(() => {
        setBoatsOnMap([{ id: 1, x: 200, y: 200, width: 100, height: 50, color: 'purple', angle: 0 }]);
      })
      .catch(error => console.error('Error clearing boats on map:', error));
  };
  

  const handleClearSearch = () => {
    setFilteredBoatListings(boatListings);
    setCurrentPage(1);
    updateTotalPages(boatListings);
  };

  const fetchBoatsOnMap = () => {
    axios.get('http://localhost:5000/boats-on-map')
      .then(response => setBoatsOnMap(response.data.boats_on_map))
      .catch(error => console.error('Error loading boats-on-map data:', error));
  };
  
  useEffect(() => {
    fetchBoatsOnMap();
  }, []);

  const saveBoatOnMap = (updatedBoatOnMap) => {
    axios.put(`http://localhost:5000/boats-on-map/${updatedBoatOnMap.boat_on_map_id}`, updatedBoatOnMap)
      .then(() => console.log('BoatOnMap updated successfully'))
      .catch(error => console.error('Error saving boatOnMap data:', error));
  };

  const currentBoatListings = filteredBoatListings.slice(
    (currentPage - 1) * boatListingsPerPage,
    currentPage * boatListingsPerPage
  );

  const matchBoatOnMapIdToBoatListing = (boatOnMapId) => {
    const matchingBoatListings = boatListings.filter(
      (boatListing) => boatListing.boat_on_map_id === boatOnMapId
    );
  
    if (matchingBoatListings.length > 0) {
      console.log(`Found ${matchingBoatListings.length} matching boat listing(s):`, matchingBoatListings);
      return matchingBoatListings;
    } else {
      console.log('No matching boat listings found for the given boat_on_map_id.');
      return [];
    }
  };

  const enterBoatFindMode = (boatListing) => {
    setBoatFindMode(true);
    setHighlightedBoatId(boatListing.boat_on_map_id);
    
    // Find the boat's position on the map
    const boat = boatsOnMap.find(boat => boat.boat_on_map_id === boatListing.boat_on_map_id);
    if (boat) {
      // Get the map element's position
      const mapElement = document.querySelector('.map-canvas');
      if (mapElement) {
        // Calculate scroll position based on boat's y position
        const mapRect = mapElement.getBoundingClientRect();
        const scrollTo = mapRect.top + boat.y - (window.innerHeight / 3); // Position boat 1/3 from top
        
        // Smooth scroll to the boat
        window.scrollTo({
          top: scrollTo,
          behavior: 'smooth'
        });
      }
    }
    
    setTimeout(() => {
      alert(`This is where the boat for ${boatListing.name || 'Untitled'} is`);
      setBoatFindMode(false);
      setHighlightedBoatId(null);
    }, 500); // Increased timeout to allow for smooth scrolling
  };

  const assignBoatListingToMap = (boatListing) => {
    if (!activeBoatOnMapId) {
      alert('No active boat selected on the map.');
      return;
    }
  
    setShowConfirmation({
      message: `Assign this map selection to Boat Listing ‘${boatListing.name || 'Untitled'}’?`,
      onYes: () => {
        const updatedBoatListing = { ...boatListing, boat_on_map_id: activeBoatOnMapId };
        console.log("Here's your updated boat listing:", updatedBoatListing);
        axios
          .put(`${API_URL}/${boatListing.boat_listing_id}`, updatedBoatListing)
          .then(() => {
            fetchAllBoatListings(); // Refresh data after update
            setShowConfirmation(false); // Close modal
          })
          .catch((error) => console.error('Error assigning boat listing to map:', error));
      },
      onNo: () => setShowConfirmation(false),
    });
  };  
  

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
            boatFindMode={boatFindMode}
            highlightedBoatId={highlightedBoatId}
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
            boatListings={currentBoatListings}
            onEdit={openForm}
            onDelete={confirmDelete}
            boatsOnMap={boatsOnMap}
            setBoatsOnMap={setBoatsOnMap}
            activeBoatOnMapId={activeBoatOnMapId}
            assignBoatListingToMap={assignBoatListingToMap}
            onViewBoat={enterBoatFindMode}
          />
        </div>
      </div>
      {showForm && (
        <BoatForm boat={selectedBoatListing} onSave={handleSave} onClose={closeForm} />
      )}
      {showConfirmation && (
        <AreYouSure
          message={showConfirmation.message}
          onYes={showConfirmation.onYes}
          onNo={showConfirmation.onNo}
        />
      )}
    </div>
  );
}

export default App;
