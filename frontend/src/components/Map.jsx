// ./components/Map.jsx

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Ellipse, Image } from 'react-konva';
import useImage from 'use-image';
import axios from 'axios';
import AreYouSure from './AreYouSure'; // Import AreYouSure component
import './../styles/Map.css'; // Ensure you have basic styles

function Map() {
  const [shapes, setShapes] = useState([]);
  const [activeShapeId, setActiveShapeId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const colorOptions = ['blue', 'red', 'purple', 'pink', 'green'];
  const [colorIndex, setColorIndex] = useState(0);
  const [mapImage] = useImage('/map_for_inkscape.svg');
  const [scaleImage] = useImage('/scale.png');
  const [scalePosition, setScalePosition] = useState({ x: 450, y: 1094 });
  const [scaleDraggable, setScaleDraggable] = useState(true);

  const mapWidth = 794;
  const mapHeight = 1123;

  useEffect(() => {
    // Load boats on map from backend
    axios.get('http://localhost:5000/boats-on-map')
      .then(response => setShapes(response.data.boats_on_map))
      .catch(error => console.error('Error loading boat-on-map data:', error));
  }, []);

  const saveBoatOnMap = (updatedShape) => {
    axios.put(`http://localhost:5000/boats-on-map/${updatedShape.id}`, updatedShape)
      .then(() => console.log('BoatOnMap updated successfully'))
      .catch(error => console.error('Error saving boat-on-map data:', error));
  };

  const clearAllBoatData = () => {
    axios.delete('http://localhost:5000/boats-on-map/clear')
      .then(() => {
        setShapes([{ id: 1, x: 200, y: 200, width: 100, height: 50, color: 'purple', angle: 0 }]);
      })
      .catch(error => console.error('Error clearing boats:', error));
  };

  const handleKeyDown = (e) => {
    if (activeShapeId === null) return;

    let newShapes = [...shapes];
    const activeShape = newShapes.find(shape => shape.id === activeShapeId);

    if (!activeShape) return;

    switch (e.key) {
      case 'u': // Up
        activeShape.y = Math.max(activeShape.y - speed, 25);
        break;
      case 'n': // Down
        activeShape.y = Math.min(activeShape.y + speed, mapHeight - 25);
        break;
      case 'h': // Left
        activeShape.x = Math.max(activeShape.x - speed, 75);
        break;
      case 'j': // Right
        activeShape.x = Math.min(activeShape.x + speed, mapWidth - 230);
        break;
      case '[': // Rotate counterclockwise
        activeShape.angle -= 5;
        break;
      case ']': // Rotate clockwise
        activeShape.angle += 5;
        break;
      case '=': // Increase size
        activeShape.width += 5;
        activeShape.height += 3.5;
        break;
      case '-': // Decrease size
        if (activeShape.width > 1 && activeShape.height > 0.5) {
          activeShape.width -= 5;
          activeShape.height -= 3.5;
        }
        break;
      case 'c': // Change color
        setColorIndex((prevIndex) => (prevIndex + 1) % colorOptions.length);
        activeShape.color = colorOptions[(colorIndex + 1) % colorOptions.length];
        break;
      default:
        return;
    }

    setShapes(newShapes);
    saveBoatOnMap(activeShape);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shapes, activeShapeId, speed]);

  const handleShapeClick = (id) => setActiveShapeId(id);

  const handleDragStart = (id) => setIsDragging(true);

  const handleDragEnd = (e, id) => {
    const newX = Math.max(0, Math.min(e.target.x(), mapWidth));
    const newY = Math.max(0, Math.min(e.target.y(), mapHeight));

    const newShapes = shapes.map(shape =>
      shape.id === id ? { ...shape, x: newX, y: newY } : shape
    );

    setShapes(newShapes);
    saveBoatOnMap({ ...shapes.find(shape => shape.id === id), x: newX, y: newY });
    setIsDragging(false);
  };

  const handleScaleDragEnd = (e) => {
    const newX = Math.max(0, Math.min(e.target.x(), mapWidth));
    const newY = Math.max(0, Math.min(e.target.y(), mapHeight));
    setScalePosition({ x: newX, y: newY });
  };

  const addNewBoat = () => {
    const newId = shapes.length ? Math.max(...shapes.map(shape => shape.id)) + 1 : 1;
    const newBoat = { id: newId, x: 200, y: 200, width: 100, height: 50, color: 'purple', angle: 0 };
    setShapes([...shapes, newBoat]);

    axios.post('http://localhost:5000/boats-on-map', newBoat)
      .then(() => console.log('New boat added to backend'))
      .catch(error => console.error('Error adding new boat:', error));
  };

  const bringBoatToCenter = () => {
    if (activeShapeId === null) return;

    const newShapes = shapes.map(shape =>
      shape.id === activeShapeId
        ? { ...shape, x: mapWidth / 2, y: mapHeight / 2 }
        : shape
    );

    setShapes(newShapes);
    saveBoatOnMap({ ...shapes.find(shape => shape.id === activeShapeId), x: mapWidth / 2, y: mapHeight / 2 });
  };

  const confirmDeletion = () => {
    const shapeToDelete = shapes.find(shape => shape.id === activeShapeId);
    if (!shapeToDelete) return;

    axios.delete(`http://localhost:5000/boats-on-map/${activeShapeId}`)
      .then(() => {
        setShapes(shapes.filter(shape => shape.id !== activeShapeId));
        setActiveShapeId(null);
        setShowConfirmation(false);
      })
      .catch(error => console.error('Error deleting boat:', error));
  };

  return (
    <div>
      <Stage width={mapWidth} height={mapHeight} className="map-canvas">
        <Layer>
          <Image image={mapImage} width={mapWidth} height={mapHeight} />
          {shapes.map(shape => (
            <Ellipse
              key={shape.id}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill={shape.color}
              rotation={shape.angle}
              draggable
              onClick={() => handleShapeClick(shape.id)}
              onDragStart={() => handleDragStart(shape.id)}
              onDragEnd={(e) => handleDragEnd(e, shape.id)}
              stroke="black"
              strokeWidth={1}
            />
          ))}
          {scaleImage && (
            <Image
              image={scaleImage}
              x={scalePosition.x}
              y={scalePosition.y}
              draggable={scaleDraggable}
              onDragEnd={handleScaleDragEnd}
              scaleX={0.5}
              scaleY={0.5}
            />
          )}
        </Layer>
      </Stage>
      <div className="menu">
        <label>
          Speed:
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            min="1"
          />
        </label>
        <button onClick={addNewBoat}>Add Boat to Map</button>
        <button onClick={clearAllBoatData}>Clear All Boat Data</button>
        <button onClick={bringBoatToCenter}>Bring Boat Back to Center</button>
      </div>
      {showConfirmation && (
        <AreYouSure
          message="Are you sure you want to delete this boat?"
          onYes={confirmDeletion}
          onNo={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}

export default Map;
