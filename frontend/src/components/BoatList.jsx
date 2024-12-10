// ./components/BoatList.jsx

import React from 'react';

function BoatList({ boatListings = [], onEdit, onDelete, setBoatsOnMap }) {
  const handleViewBoatOnMap = (boat) => {
    const boatOnMapId = boat.boat_on_map_id;
    if (!boatOnMapId) return;
  
    alert(`This is where the boat for ${boat.name} is`);
    setBoatsOnMap(shapes.map(shape =>
      shape.id === boatOnMapId ? { ...shape, visible: true } : { ...shape, visible: false }
    ));
  };

  if (!boatListings || boatListings.length === 0) {
    return <p>No boat listings available. Add a new boat to get started!</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {boatListings.map(boatListing => (
        <li key={boatListing.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 70%' }}>
            <strong>
              {boatListing.name 
                ? `#${boatListing.index} ${boatListing.name} - ${boatListing.make_model} (${boatListing.size} ft)` 
                : `#${boatListing.index} ${boatListing.make_model} (${boatListing.size} ft)`}
            </strong>
            <br />
            Customer: {boatListing.customer_name}
          </div>
          <div style={{ flex: '1 1 30%', textAlign: 'right' }}>
            <button onClick={() => onEdit(boatListing)} style={{ marginRight: '10px' }}>Info</button>
            <button onClick={() => onDelete(boatListing.id)}>Delete</button>
            <button onClick={() => handleViewBoatOnMap(boatListing)}>
              {boatListing.boat_on_map_id ? "View Boat on Map" : "Unassigned"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default BoatList;
