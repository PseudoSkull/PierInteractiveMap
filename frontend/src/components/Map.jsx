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
        console.log('No active boatOnMap to control');
        return;
      }

      let newBoatsOnMap = [...boatsOnMap];
      const activeBoatOnMap = newBoatsOnMap.find(boatOnMap => boatOnMap.boat_on_map_id === activeBoatOnMapId);

      if (!activeBoatOnMap) {
        console.log('Active boatOnMap not found');
        return;
      }

      switch (e.key) {
        case 'u': // Up
          activeBoatOnMap.y = Math.max(activeBoatOnMap.y - speed, maxUp);
          break;
        case 'n': // Down
          activeBoatOnMap.y = Math.min(activeBoatOnMap.y + speed, maxDown);
          break;
        case 'h': // Left
          activeBoatOnMap.x = Math.max(activeBoatOnMap.x - speed, maxLeft);
          break;
        case 'j': // Right
          activeBoatOnMap.x = Math.min(activeBoatOnMap.x + speed, maxRight);
          break;
        case '[': // Rotate counterclockwise
          activeBoatOnMap.angle -= 5;
          break;
        case ']': // Rotate clockwise
          activeBoatOnMap.angle += 5;
          break;
        case '=': // Increase size
          activeBoatOnMap.width += 5;
          activeBoatOnMap.height += 3.5;
          break;
        case '-': // Decrease size
          if (activeBoatOnMap.width > 1 && activeBoatOnMap.height > 0.5) {
            activeBoatOnMap.width -= 5;
            activeBoatOnMap.height -= 3.5;
          }
          break;
        case 'c': // Change color
          setColorIndex((prevIndex) => (prevIndex + 1) % colorOptions.length);
          activeBoatOnMap.color = colorOptions[(colorIndex + 1) % colorOptions.length];
          break;
        case 'w': // Increase width
          activeBoatOnMap.width += 5;
          break;
        case 'e': // Increase height
          activeBoatOnMap.height += 5;
          break;
        case 's': // Decrease width
          if (activeBoatOnMap.width > 5) activeBoatOnMap.width -= 5;
          break;
        case 'd': // Decrease height
          if (activeBoatOnMap.height > 5) activeBoatOnMap.height -= 5;
          break;
        default:
          break;
      }

      setBoatsOnMap(newBoatsOnMap);
      saveBoatOnMap(activeBoatOnMap); // Save the updated boatOnMap to the backend
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [boatsOnMap, activeBoatOnMapId, speed, mapWidth, mapHeight, colorOptions, colorIndex]);

  const handleBoatOnMapClick = (boatOnMapId) => {
    console.log('boatOnMap clicked:', boatOnMapId);
    setActiveBoatOnMapId(boatOnMapId);
  };

  const handleDragStart = (boatOnMapId) => {
    console.log('Drag started on boatOnMap:', boatOnMapId);
    setIsDragging(true);
    setActiveBoatOnMapId(boatOnMapId);
  };

  const handleDragEnd = (e, boatOnMapId) => {
    console.log('Drag ended on boatOnMap:', boatOnMapId);
  
    // Get the new position of the dragged boatOnMap
    const newX = e.target.x();
    const newY = e.target.y();
  
    // Check if the boatOnMap is completely outside the boundaries
    const isOutOfBounds =
      newX < 0 || newY < 0 || newX > mapWidth || newY > mapHeight;
  
    // Update the boatOnMap's position
    const newBoatsOnMap = boatsOnMap.map(boatOnMap =>
      boatOnMap.boat_on_map_id === boatOnMapId
        ? {
            ...boatOnMap,
            x: isOutOfBounds ? scalePosition.x - 200 : Math.max(0, Math.min(newX, mapWidth)),
            y: isOutOfBounds ? scalePosition.y - 200 : Math.max(0, Math.min(newY, mapHeight))
          }
        : boatOnMap
    );
  
    setBoatsOnMap(newBoatsOnMap);

    // Save the updated boatOnMap position to the backend
    const updatedBoatOnMap = newBoatsOnMap.find(boatOnMap => boatOnMap.boat_on_map_id === boatOnMapId);
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
    const newBoatOnMapId = boatsOnMap.length ? Math.max(...boatsOnMap.map(boatOnMap => boatOnMap.boat_on_map_id)) + 1 : 1;
    console.log('Adding new boat with ID:', newBoatOnMapId);
    const newBoat = { boat_on_map_id: newBoatOnMapId, x: 200, y: 200, width: 100, height: 50, color: 'purple', angle: 0, border: null };
    setBoatsOnMap([...boatsOnMap, newBoat]);

    // Add new boat to the backend
    axios.post('http://localhost:5000/boats-on-map', newBoat)
      .then(() => console.log('New boat added to backend'))
      .catch(error => console.error('Error adding new boat:', error));
  };

  const confirmDeletion = () => {
    const boatOnMapToDelete = boatsOnMap.find(boatOnMap => boatOnMap.boat_on_map_id === activeBoatOnMapId);
    if (!boatOnMapToDelete) return;

    axios.delete(`http://localhost:5000/boats-on-map/${activeBoatOnMapId}`)
      .then(() => {
        setBoatsOnMap(boatsOnMap.filter(boatOnMap => boatOnMap.boat_on_map_id !== activeBoatOnMapId));
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
  
    // Update the position of the active boatOnMap to the center of the map
    const newBoatsOnMap = boatsOnMap.map(boatOnMap =>
      boatOnMap.boat_on_map_id === activeBoatOnMapId
        ? { ...boatOnMap, x: mapWidth / 2, y: mapHeight / 2 }
        : boatOnMap
    );
  
    setBoatsOnMap(newBoatsOnMap);

    // Save the updated boatOnMap position to the backend
    const updatedBoatOnMap = newBoatsOnMap.find(boatOnMap => boatOnMap.boat_on_map_id === activeBoatOnMapId);
    if (updatedBoatOnMap) {
      saveBoatOnMap(updatedBoatOnMap);
    }
    console.log(`Boat on map with ID ${activeBoatOnMapId} brought back to center.`);
  };
  
  return (
    <div>
      <Stage width={mapWidth} height={mapHeight} className="map-canvas">
        <Layer>
          <Image image={mapImage} width={mapWidth} height={mapHeight} />
          {boatsOnMap.map(boatOnMap => (
            <Ellipse
              key={boatOnMap.boat_on_map_id}
              x={boatOnMap.x}
              y={boatOnMap.y}
              width={boatOnMap.width}
              height={boatOnMap.height}
              fill={boatOnMap.color}
              rotation={boatOnMap.angle}
              draggable
              onClick={() => handleBoatOnMapClick(boatOnMap.boat_on_map_id)}
              onDragStart={() => handleDragStart(boatOnMap.boat_on_map_id)}
              onDragEnd={(e) => handleDragEnd(e, boatOnMap.boat_on_map_id)}
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
