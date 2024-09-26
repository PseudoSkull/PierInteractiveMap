import React from 'react';

function BoatList({ boats = [], onEdit, onDelete }) {
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
          </div>
        </li>
      ))}
    </ul>
  );
}

export default BoatList;
