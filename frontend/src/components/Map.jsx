import React, { useState, useEffect } from 'react';
import { Stage, Layer, Ellipse, Image } from 'react-konva';
import useImage from 'use-image';
import './../styles/Map.css'; // Ensure you have basic styles

function Map() {
  const [shapes, setShapes] = useState([{ id: 1, x: 150, y: 100, width: 100, height: 50, color: 'purple', angle: 0 }]);
  const [activeShapeId, setActiveShapeId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [speed, setSpeed] = useState(5);
  const colorOptions = ['blue', 'red', 'purple', 'pink', 'green'];
  const [colorIndex, setColorIndex] = useState(0);
  const [mapImage] = useImage('/map_for_inkscape.svg');
  const [scaleImage] = useImage('/scale.png');
  const [scalePosition, setScalePosition] = useState({ x: 750, y: 1070 }); // Bottom-right corner
  const [scaleDraggable, setScaleDraggable] = useState(true);

  const mapWidth = 794;
  const mapHeight = 1123;
  const maxUp = 25;
  const maxDown = mapHeight - 25;
  const maxLeft = 75;
  const maxRight = mapWidth - 230;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeShapeId === null) {
        console.log('No active shape to control');
        return;
      }

      let newShapes = [...shapes];
      const activeShape = newShapes.find(shape => shape.id === activeShapeId);

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

      setShapes(newShapes);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shapes, activeShapeId, speed, mapWidth, mapHeight]);

  const handleShapeClick = (id) => {
    console.log('Shape clicked:', id);
    setActiveShapeId(id);
  };

  const handleDragStart = (id) => {
    console.log('Drag started on shape:', id);
    setIsDragging(true);
  };

  const handleDragEnd = (e, id) => {
    console.log('Drag ended on shape:', id);
    const newX = Math.max(0, Math.min(e.target.x(), mapWidth));
    const newY = Math.max(0, Math.min(e.target.y(), mapHeight));

    setIsDragging(false);
    const newShapes = shapes.map(shape =>
      shape.id === id ? { ...shape, x: newX, y: newY } : shape
    );
    setShapes(newShapes);
  };

  const handleScaleDragEnd = (e) => {
    const newX = Math.max(0, Math.min(e.target.x(), mapWidth));
    const newY = Math.max(0, Math.min(e.target.y(), mapHeight));
    console.log(`Scale drag ended at x ${newX} y ${newY}`);
    setScalePosition({ x: newX, y: newY });
  };

  const addNewBoat = () => {
    const newId = shapes.length ? Math.max(...shapes.map(shape => shape.id)) + 1 : 1;
    console.log('Adding new boat with ID:', newId);
    setShapes([...shapes, { id: newId, x: 200, y: 200, width: 100, height: 50, color: 'purple', angle: 0 }]);
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
              strokeWidth={2}
            />
          ))}
          {scaleImage && (
            <Image
              image={scaleImage}
              x={437}
              y={1094}
              draggable={scaleDraggable}
              onDragEnd={handleScaleDragEnd}
              scaleX={0.5} // Scale down the width to half
              scaleY={0.5} // Scale down the height to half
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
      </div>
    </div>
  );
}

export default Map;
