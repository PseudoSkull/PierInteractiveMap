// ./components/BoatList.jsx

import React from 'react';

function BoatList({ boats = [], onEdit, onDelete }) {
  const handleViewBoatOnMap = (boat) => {
    const boatOnMapId = boat.boat_on_map_id;
    if (!boatOnMapId) return;
  
    alert(`This is where the boat for ${boat.name} is`);
    setShapes(shapes.map(shape =>
      shape.id === boatOnMapId ? { ...shape, visible: true } : { ...shape, visible: false }
    ));
  };

  if (!boats || boats.length === 0) {
    return <p>No boats available. Add a new boat to get started!</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {boats.map(boat => (
        <li key={boat.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 70%' }}>
            <strong>
              {boat.name 
                ? `#${boat.index} ${boat.name} - ${boat.make_model} (${boat.size} ft)` 
                : `#${boat.index} ${boat.make_model} (${boat.size} ft)`}
            </strong>
            <br />
            Customer: {boat.customer_name}
          </div>
          <div style={{ flex: '1 1 30%', textAlign: 'right' }}>
            <button onClick={() => onEdit(boat)} style={{ marginRight: '10px' }}>View</button>
            <button onClick={() => onDelete(boat.id)}>Delete</button>
            <button onClick={() => handleViewBoatOnMap(boat)}>
              {boat.boat_on_map_id ? "View Boat on Map" : "Unassigned"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default BoatList;
