import React, { useState, useEffect } from 'react';

function BoatForm({ boat, onSave, onClose }) {
  const [formData, setFormData] = useState({
    size: '',
    name: '',
    make_model: '',
    notes: '',
    index: '',
    section: ''
  });

  useEffect(() => {
    if (boat) {
      setFormData(boat);
    }
  }, [boat]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="form-overlay">
      <form onSubmit={handleSubmit} className="boat-form">
        <h3>{boat ? 'Edit Boat' : 'Add Boat'}</h3>
        <div>
          <label>Size:</label>
          <input type="text" name="size" value={formData.size} onChange={handleChange} required />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Make and Model:</label>
          <input type="text" name="make_model" value={formData.make_model} onChange={handleChange} required />
        </div>
        <div>
          <label>Notes:</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>
        </div>
        <div>
          <label>Index:</label>
          <input type="number" name="index" value={formData.index} onChange={handleChange} required />
        </div>
        <div>
          <label>Section:</label>
          <input type="text" name="section" value={formData.section} onChange={handleChange} required />
        </div>
        <div className="form-buttons">
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default BoatForm;
