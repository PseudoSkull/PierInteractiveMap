import React from 'react';

function AreYouSure({ message, onYes, onNo }) {
  return (
    <div className="confirmation-overlay">
      <div className="confirmation-box">
        <p>{message}</p>
        <div className="confirmation-buttons">
          <button onClick={onYes}>Yes</button>
          <button onClick={onNo}>No</button>
        </div>
      </div>
    </div>
  );
}

export default AreYouSure;
