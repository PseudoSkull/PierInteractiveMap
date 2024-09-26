import React from 'react';

function BoatList({ boats = [], onEdit, onDelete }) {
  if (!boats || boats.length === 0) {
    return <p>No boats available. Add a new boat to get started!</p>;
  }

  return (
    <ul>
      {boats.map(boat => (
        <li key={boat.id}>
          <div>
            <strong>
              {boat.name 
                ? `${boat.name} - ${boat.make_model} (${boat.size} ft)` 
                : `${boat.make_model} (${boat.size} ft)`}
            </strong>
          </div>
          <div>
            <button onClick={() => onEdit(boat)}>Edit</button>
            <button onClick={() => onDelete(boat.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default BoatList;
