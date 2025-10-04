// frontend/src/MainCode.jsx

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import BoatList from './components/BoatList';
import BoatForm from './components/BoatForm';
import AreYouSure from './components/AreYouSure';
import Header from './components/Header';
import Map from './components/Map';
import Subheader from './components/Subheader';
import VersionHistory from './components/VersionHistory';
import VersionViewer from './components/VersionViewer';
import './styles/App.css';

function MainCode({ session, supabase, appBackendHost, appBackendPort }) {
  const backendURLPrefix = appBackendPort
    ? `http://${appBackendHost}:${appBackendPort}`
    : `https://${appBackendHost}`;
  
  const boatListingsURL = `${backendURLPrefix}/boat_listings`;
  
  const [boatListings, setBoatListings] = useState([]);
  const [filteredBoatListings, setFilteredBoatListings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [boatListingsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBoatListing, setSelectedBoatListing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [boatsOnMap, setBoatsOnMap] = useState([]);
  const [activeBoatOnMapId, setActiveBoatOnMapId] = useState(null);
  const [boatFindMode, setBoatFindMode] = useState(false);
  const [highlightedBoatId, setHighlightedBoatId] = useState(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [unassignedOnlyMode, setAssignedOnlyMode] = useState(false);
  const [selectedBoatOnMap, setSelectedBoatOnMap] = useState(null);

  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [viewingVersionId, setViewingVersionId] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [lastChange, setLastChange] = useState(Date.now());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchAllBoatListings();
    fetchBoatsOnMap();
    fetchCurrentVersion();
    
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        handleSaveVersion();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(autoSaveInterval);
  }, []);

  const fetchCurrentVersion = async () => {
    try {
      const sessionCookie = Cookies.get('supabase-session');
      const response = await fetch(`${backendURLPrefix}/versions/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentVersion(data);
      }
    } catch (error) {
      console.error('Error fetching current version:', error);
    }
  };

  const handleSaveVersion = async () => {
    const sessionCookie = Cookies.get('supabase-session');
    
    try {
      const response = await fetch(`${backendURLPrefix}/versions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({})
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        fetchCurrentVersion();
        fetchAllBoatListings();
        fetchBoatsOnMap();
        alert('Version saved successfully!');
      }
    } catch (error) {
      console.error('Error saving version:', error);
    }
  };

  const markChanged = () => {
    setHasUnsavedChanges(true);
    setLastChange(Date.now());
  };

  const fetchAllBoatListings = async () => {
    try {
      const sessionCookie = Cookies.get('supabase-session');
  
      const response = await fetch(boatListingsURL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching boats: ${response.statusText}`);
      }
  
      const data = await response.json();
      const boatData = data.boat_listings || [];
  
      setBoatListings(boatData);
      setFilteredBoatListings(boatData);
      setTotalPages(Math.ceil(boatData.length / boatListingsPerPage));
    } catch (error) {
      console.error('Error fetching boats:', error);
    }
  };

  const handleDelete = async (boatListingId) => {
    const sessionCookie = Cookies.get('supabase-session');
  
    try {
      const response = await fetch(`${boatListingsURL}/${boatListingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`
        }
      });
  
      if (response.ok) {
        const updatedBoatListings = boatListings.filter(
          (boatListing) => boatListing.boat_listing_id !== boatListingId
        );
        setBoatListings(updatedBoatListings);
        setFilteredBoatListings(updatedBoatListings);
        setShowConfirmation(false);
        updateTotalPages(updatedBoatListings);
        markChanged();
      } else {
        console.error('Error deleting boat listing');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };  

  const updateTotalPages = (filteredBoatListingsList) => {
    const pages = Math.max(1, Math.ceil(filteredBoatListingsList.length / boatListingsPerPage));
    setTotalPages(pages);
  };  

  const handlePageChange = (direction) => {
    setCurrentPage(prevPage => {
      if (direction === 'next' && prevPage < totalPages) {
        return prevPage + 1;
      } else if (direction === 'prev' && prevPage > 1) {
        return prevPage - 1;
      }
      return prevPage;
    });
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

  const handleSave = async (boatListing) => {
    const sessionCookie = Cookies.get('supabase-session');
    const boatListingId = boatListing.boat_listing_id;
  
    try {
      const response = await fetch(
        boatListingId ? `${boatListingsURL}/${boatListingId}` : boatListingsURL,
        {
          method: boatListingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`
          },
          body: JSON.stringify(boatListing)
        }
      );
  
      if (response.ok) {
        fetchAllBoatListings();
        closeForm();
        markChanged();
      } else {
        console.error('Error saving boat listing');
      }
    } catch (error) {
      console.error('Error:', error);
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

  const handleClearSearch = () => {
    setFilteredBoatListings(boatListings);
    setCurrentPage(1);
    updateTotalPages(boatListings);
  };

  const fetchBoatsOnMap = async () => {
    const sessionCookie = Cookies.get('supabase-session');
  
    try {
      const response = await fetch(`${backendURLPrefix}/boats-on-map`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        setBoatsOnMap(data.boats_on_map);
      } else {
        console.error('Error loading boats-on-map data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveBoatOnMap = async (updatedBoatOnMap) => {
    const sessionCookie = Cookies.get('supabase-session');
  
    try {
      const response = await fetch(`${backendURLPrefix}/boats-on-map/${updatedBoatOnMap.boat_on_map_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`
        },
        body: JSON.stringify(updatedBoatOnMap)
      });
  
      if (response.ok) {
        console.log('BoatOnMap updated successfully');
        markChanged();
      } else {
        console.error('Error saving boatOnMap data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };  

  const currentBoatListings = filteredBoatListings.slice(
    (currentPage - 1) * boatListingsPerPage,
    currentPage * boatListingsPerPage
  );

  const enterBoatFindMode = (boatListing) => {
    setBoatFindMode(true);
    const boat = boatsOnMap.find(boat => boat.id === boatListing.map_position_id);
    
    if (boat) {
      setHighlightedBoatId(boat.boat_on_map_id);
      
      const mapElement = document.querySelector('.map-canvas');
      if (mapElement) {
        const mapRect = mapElement.getBoundingClientRect();
        const scrollTo = mapRect.top + boat.y - (window.innerHeight / 3);

        window.scrollTo({
          top: scrollTo,
          behavior: 'smooth',
        });
      }
    }

    setTimeout(() => {
      alert(`This is where the boat for ${boatListing.name || 'Untitled'} is`);
      setBoatFindMode(false);
      setHighlightedBoatId(null);
    }, 500);
  };

  const addNewBoatOnMap = async () => {
    const sessionCookie = Cookies.get('supabase-session');
  
    const newBoatOnMapId = boatsOnMap.length
      ? Math.max(...boatsOnMap.map(boatOnMap => boatOnMap.boat_on_map_id)) + 1
      : 1;
  
    const newBoat = {
      boat_on_map_id: newBoatOnMapId,
      x: 200,
      y: 200,
      width: 100,
      height: 50,
      color: 'purple',
      angle: 0,
    };
  
    setBoatsOnMap([...boatsOnMap, newBoat]);
  
    try {
      const response = await fetch(`${backendURLPrefix}/boats-on-map`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`
        },
        body: JSON.stringify(newBoat)
      });
  
      if (response.ok) {
        console.log('New boat added to backend');
        markChanged();
      } else {
        console.error('Error adding new boat');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };  

  const bringBoatToCenter = () => {
    if (activeBoatOnMapId === null) {
      console.log("No boat selected to bring back to center.");
      return;
    }

    const newBoatsOnMap = boatsOnMap.map(boatOnMap =>
      boatOnMap.boat_on_map_id === activeBoatOnMapId
        ? { ...boatOnMap, x: 200, y: 200 }
        : boatOnMap
    );

    setBoatsOnMap(newBoatsOnMap);

    const updatedBoatOnMap = newBoatsOnMap.find(boatOnMap => boatOnMap.boat_on_map_id === activeBoatOnMapId);
    if (updatedBoatOnMap) {
      saveBoatOnMap(updatedBoatOnMap);
    }
    console.log(`Boat on map with ID ${activeBoatOnMapId} brought back to center.`);
  };

  const assignBoatListingToMap = (boatListing) => {
    if (!activeBoatOnMapId) {
      alert('No active boat selected on the map.');
      return;
    }
  
    setShowConfirmation({
      message: `Assign this map selection to Boat Listing '${boatListing.name || 'Untitled'}'?`,
      onYes: async () => {
        const sessionCookie = Cookies.get('supabase-session');
        const mapPosition = boatsOnMap.find(b => b.boat_on_map_id === activeBoatOnMapId);
        const updatedBoatListing = { ...boatListing, map_position_id: mapPosition?.id };
  
        try {
          const response = await fetch(`${boatListingsURL}/${boatListing.boat_listing_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${JSON.parse(sessionCookie).access_token}`
            },
            body: JSON.stringify(updatedBoatListing)
          });
  
          if (response.ok) {
            fetchAllBoatListings();
            setShowConfirmation(false);
            markChanged();
          } else {
            console.error('Error assigning boat listing to map');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      },
      onNo: () => setShowConfirmation(false),
    });
  };  

  const toggleAssignedOnlyMode = () => {
    setAssignedOnlyMode(!unassignedOnlyMode);
  };

  const handleShowAssociatedBoat = (boatListing) => {
    setFilteredBoatListings([boatListing]);
    setCurrentPage(1);
    updateTotalPages([boatListing]);
  };

  const filteredBoatsOnMap = unassignedOnlyMode
    ? boatsOnMap.filter((boatOnMap) =>
        !boatListings.some(
          (boatListing) => boatListing.map_position_id === boatOnMap.id
        )
      )
    : boatsOnMap;

  const filteredBoatListingsForDisplay = (unassignedOnlyMode
    ? filteredBoatListings.filter((boatListing) => boatListing.map_position_id === null)
    : filteredBoatListings
  ).slice(
    (currentPage - 1) * boatListingsPerPage,
    currentPage * boatListingsPerPage
  );

  const handleViewVersion = (versionId) => {
    setViewingVersionId(versionId);
    setShowVersionHistory(false);
  };

  const handleBackToMain = () => {
    setViewingVersionId(null);
    setShowVersionHistory(false);
  };

  const handleBackToVersions = () => {
    setViewingVersionId(null);
    setShowVersionHistory(true);
  };

  if (viewingVersionId) {
    return (
      <VersionViewer
        backendURLPrefix={backendURLPrefix}
        versionId={viewingVersionId}
        onBack={handleBackToVersions}
      />
    );
  }

  if (showVersionHistory) {
    return (
      <VersionHistory
        backendURLPrefix={backendURLPrefix}
        onClose={handleBackToMain}
        onViewVersion={handleViewVersion}
      />
    );
  }

  return (
    <div className="app">
      <div className="top-bar">
        <span>Signed in as {session.user.email}</span>
        <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        <div className="version-controls">
          <span>
            Now on version: {currentVersion ? new Date(currentVersion.saved_at).toLocaleString() : 'Loading...'}
          </span>
          <button onClick={handleSaveVersion}>Save Version</button>
          <button onClick={() => setShowVersionHistory(true)}>Version History</button>
        </div>
      </div>
      <Header onSearch={handleSearch} onClear={handleClearSearch} />
      <Subheader
        addNewBoatOnMap={addNewBoatOnMap}
        bringBoatToCenter={bringBoatToCenter}
        toggleAssignedOnlyMode={toggleAssignedOnlyMode}
        unassignedOnlyMode={unassignedOnlyMode}
        selectedBoatOnMap={selectedBoatOnMap}
        boatListings={boatListings}
        onShowAssociatedBoat={handleShowAssociatedBoat}
      />
      <div className="container">
        <div className="map-section">
          <Map
            backendURLPrefix={backendURLPrefix}
            boatsOnMap={filteredBoatsOnMap}
            setBoatsOnMap={setBoatsOnMap}
            saveBoatOnMap={saveBoatOnMap}
            activeBoatOnMapId={activeBoatOnMapId}
            setActiveBoatOnMapId={(boatOnMapId) => {
              const boat = boatsOnMap.find((b) => b.boat_on_map_id === boatOnMapId);
              setSelectedBoatOnMap(boat);
              setActiveBoatOnMapId(boatOnMapId);
            }}            
            boatFindMode={boatFindMode}
            highlightedBoatId={highlightedBoatId}
            addNewBoatOnMap={addNewBoatOnMap}
            bringBoatToCenter={bringBoatToCenter}
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
            boatListings={filteredBoatListingsForDisplay}
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

export default MainCode;