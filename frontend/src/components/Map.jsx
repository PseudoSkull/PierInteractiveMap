// ./components/Map.jsx

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Ellipse, Image } from 'react-konva';
import useImage from 'use-image';
import axios from 'axios';
import AreYouSure from './AreYouSure'; // Import AreYouSure component
import './../styles/Map.css'; // Ensure you have basic styles

function Map({ boatsOnMap, setBoatsOnMap, saveBoatOnMap, activeBoatOnMapId, setActiveBoatOnMapId }) {
  const [isDragging, setIsDragging] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const colorOptions = ['blue', 'red', 'purple', 'pink', 'green'];
  const [colorIndex, setColorIndex] = useState(0);
  const [mapImage] = useImage('/map_for_inkscape.svg');
  const [scaleImage] = useImage('/scale.png');
  const [scalePosition, setScalePosition] = useState({ x: 450, y: 1094 }); // Bottom-right corner
  const [scaleDraggable, setScaleDraggable] = useState(true);

  const mapWidth = 794;
  const mapHeight = 1123;
  const maxUp = 25;
  const maxDown = mapHeight - 25;
  const maxLeft = 75;
  const maxRight = mapWidth - 230;

  const isEditingInput = () => {
    const activeElement = document.activeElement;
    return activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditingInput()) {
        // Ignore key presses when focused on input or textarea
        return;
      }

      if (e.key === 'Backspace' && activeBoatOnMapId !== null) {
        e.preventDefault(); // Prevent browser navigation
        setShowConfirmation(true);
        return;
      }

      if (activeBoatOnMapId === null) {
        console.log('No active shape to control');
        return;
      }

      let newShapes = [...boatsOnMap];
      const activeShape = newShapes.find(shape => shape.id === activeBoatOnMapId);

      if (!activeShape) {
        console.log('Active shape not found');
        return;
      }

      switch (e.key) {
        case 'u': // Up
          activeShape.y = Math.max(activeShape.y - speed, maxUp);
          break;
        case 'n': // Down
          activeShape.y = Math.min(activeShape.y + speed, maxDown);
          break;
        case 'h': // Left
          activeShape.x = Math.max(activeShape.x - speed, maxLeft);
          break;
        case 'j': // Right
          activeShape.x = Math.min(activeShape.x + speed, maxRight);
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
        case 'w': // Increase width
          activeShape.width += 5;
          break;
        case 'e': // Increase height
          activeShape.height += 5;
          break;
        case 's': // Decrease width
          if (activeShape.width > 5) activeShape.width -= 5;
          break;
        case 'd': // Decrease height
          if (activeShape.height > 5) activeShape.height -= 5;
          break;
        default:
          break;
      }

      setBoatsOnMap(newShapes);
      saveBoatOnMap(activeShape); // Save the updated shape to the backend
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [boatsOnMap, activeBoatOnMapId, speed, mapWidth, mapHeight, colorOptions, colorIndex]);

  const handleShapeClick = (id) => {
    console.log('Shape clicked:', id);
    setActiveBoatOnMapId(id);
  };

  const handleDragStart = (id) => {
    console.log('Drag started on shape:', id);
    setIsDragging(true);
    setActiveBoatOnMapId(id);
  };

  const handleDragEnd = (e, id) => {
    console.log('Drag ended on shape:', id);
  
    // Get the new position of the dragged shape
    const newX = e.target.x();
    const newY = e.target.y();
  
    // Check if the shape is completely outside the boundaries
    const isOutOfBounds =
      newX < 0 || newY < 0 || newX > mapWidth || newY > mapHeight;
  
    // Update the shape's position
    const newBoatsOnMap = boatsOnMap.map(boatOnMap =>
      boatOnMap.id === id
        ? {
            ...boatOnMap,
            x: isOutOfBounds ? scalePosition.x - 200 : Math.max(0, Math.min(newX, mapWidth)),
            y: isOutOfBounds ? scalePosition.y - 200 : Math.max(0, Math.min(newY, mapHeight))
          }
        : boatOnMap
    );
  
    setBoatsOnMap(newBoatsOnMap);

    // Save the updated shape position to the backend
    const updatedBoatOnMap = newBoatsOnMap.find(shape => shape.id === id);
    if (updatedBoatOnMap) {
      saveBoatOnMap(updatedBoatOnMap);
    }
  };

  const handleScaleDragEnd = (e) => {
    const newX = Math.max(0, Math.min(e.target.x(), mapWidth));
    const newY = Math.max(0, Math.min(e.target.y(), mapHeight));
    console.log(`Scale drag ended at x ${newX} y ${newY}`);
    setScalePosition({ x: newX, y: newY });
  };

  const addNewBoat = () => {
    const newId = boatsOnMap.length ? Math.max(...boatsOnMap.map(shape => shape.id)) + 1 : 1;
    console.log('Adding new boat with ID:', newId);
    const newBoat = { id: newId, x: 200, y: 200, width: 100, height: 50, color: 'purple', angle: 0, border: null };
    setBoatsOnMap([...boatsOnMap, newBoat]);

    // Add new boat to the backend
    axios.post('http://localhost:5000/boats-on-map', newBoat)
      .then(() => console.log('New boat added to backend'))
      .catch(error => console.error('Error adding new boat:', error));
  };

  const confirmDeletion = () => {
    const shapeToDelete = boatsOnMap.find(shape => shape.id === activeBoatOnMapId);
    if (!shapeToDelete) return;

    axios.delete(`http://localhost:5000/boats-on-map/${activeBoatOnMapId}`)
      .then(() => {
        setBoatsOnMap(boatsOnMap.filter(shape => shape.id !== activeBoatOnMapId));
        setActiveBoatOnMapId(null);
        setShowConfirmation(false);
      })
      .catch(error => console.error('Error deleting boat:', error));
  };

  const cancelDeletion = () => {
    setShowConfirmation(false);
  };

  const bringBoatToCenter = () => {
    if (activeBoatOnMapId === null) {
      console.log("No boat selected to bring back to center.");
      return;
    }
  
    // Update the position of the active shape to the center of the map
    const newShapes = boatsOnMap.map(shape =>
      shape.id === activeBoatOnMapId
        ? { ...shape, x: mapWidth / 2, y: mapHeight / 2 }
        : shape
    );
  
    setBoatsOnMap(newShapes);

    // Save the updated shape position to the backend
    const updatedShape = newShapes.find(shape => shape.id === activeBoatOnMapId);
    if (updatedShape) {
      saveBoatOnMap(updatedShape);
    }
    console.log(`Boat with ID ${activeBoatOnMapId} brought back to center.`);
  };
  
  return (
    <div>
      <Stage width={mapWidth} height={mapHeight} className="map-canvas">
        <Layer>
          <Image image={mapImage} width={mapWidth} height={mapHeight} />
          {boatsOnMap.map(shape => (
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
        <button onClick={bringBoatToCenter}>Bring Boat Back to Center</button>
      </div>
      {showConfirmation && (
        <AreYouSure
          message="Are you sure you want to delete this boat?"
          onYes={confirmDeletion}
          onNo={cancelDeletion}
        />
      )}
    </div>
  );
}

export default Map;
