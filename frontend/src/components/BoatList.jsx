// ./components/BoatList.jsx

import React from 'react';

function BoatList({ boatListings, onEdit, onDelete, boatsOnMap, setBoatsOnMap, activeBoatOnMapId, assignBoatListingToMap, onViewBoat, unassignedOnlyMode }) {

  const filteredBoatListings = unassignedOnlyMode
  ? boatListings.filter(boatListing => !boatListing.boat_on_map_id)
  : boatListings;
  
  if (!boatListings || boatListings.length === 0) {
    return <p>No boat listings available. Add a new boat to get started!</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {boatListings.map(boatListing => (
        <li
          key={boatListing.boat_listing_id}
          style={{
            borderBottom: '1px solid #ccc',
            padding: '10px 0',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
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
            <button onClick={() => onDelete(boatListing.boat_listing_id)}>Delete</button>
            {boatListing.boat_on_map_id ? (
              <button onClick={() => onViewBoat(boatListing)}>View Boat on Map</button>
            ) : (
              <button onClick={() => assignBoatListingToMap(boatListing)}>Unassigned</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default BoatList;
