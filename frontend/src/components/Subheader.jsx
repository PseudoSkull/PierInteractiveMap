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
        console.log(`Current selected boat on map in Subheader: ${selectedBoatOnMap.boat_on_map_id}`)
        // Find the assigned boat listing for the selected boat on map
        const assignedBoat = boatListings.find(
          (boatListing) =>
            boatListing.boat_on_map_id === selectedBoatOnMap.boat_on_map_id
        );
      
        if (assignedBoat) {
          return (
            <>
              This boat (ID: {selectedBoatOnMap.boat_on_map_id}) is assigned to "{assignedBoat.name || 'Untitled'}".
              <button onClick={() => onShowAssociatedBoat(assignedBoat)}>Show Associated Boat</button>
            </>
          );
        }
      
        if (selectedBoatOnMap.boat_on_map_id === null || selectedBoatOnMap.boat_on_map_id === undefined) {
          return `This boat (ID: ${selectedBoatOnMap.boat_on_map_id || 'unknown'}) is currently unassigned.`;
        }
      
        return `This boat (ID: ${selectedBoatOnMap.boat_on_map_id}) is currently unassigned.`;
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