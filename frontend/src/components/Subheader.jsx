// ./components/Subheader.jsx

import React, { useState } from 'react';

function Subheader({
  addNewBoatOnMap,
  bringBoatToCenter,
  toggleAssignedOnlyMode,
  unassignedOnlyMode,
  selectedBoatOnMap,
  boatListings,
  onShowAssociatedBoat,
}) {
  const getBoatStatusMessage = () => {
    if (!selectedBoatOnMap) {
      return 'No boat selected';
    }

    const assignedBoat = boatListings.find(
      (boatListing) => boatListing.boat_on_map_id === selectedBoatOnMap.boat_on_map_id
    );

    if (assignedBoat) {
      return (
        <>
          This boat is assigned to {assignedBoat.name || 'Untitled'}{' '}
          <button onClick={() => onShowAssociatedBoat(assignedBoat)}>Show Associated Boat</button>
        </>
      );
    }

    return `This boat (index ${selectedBoatOnMap.boat_on_map_id || 'unknown'}) is currently unassigned.`;
  };

  return (
    <div className="subheader-container">
      <button onClick={addNewBoatOnMap}>Add Boat to Map</button>
      <button onClick={bringBoatToCenter}>Bring Boat Back to Center</button>
      <button onClick={toggleAssignedOnlyMode}>
        {unassignedOnlyMode ? 'Show Assigned Boats' : 'Hide Assigned Boats'}
      </button>
      <div className="boat-status-message">{getBoatStatusMessage()}</div>
    </div>
  );
}

export default Subheader;