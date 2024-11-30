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
          activeShape.y -= speed;
          break;
        case 'n': // Down
          activeShape.y += speed;
          break;
        case 'h': // Left
          activeShape.x -= speed;
          break;
        case 'j': // Right
          activeShape.x += speed;
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
  }, [shapes, activeShapeId, speed]);

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
    setIsDragging(false);
    const newShapes = shapes.map(shape =>
      shape.id === id ? { ...shape, x: e.target.x(), y: e.target.y() } : shape
    );
    setShapes(newShapes);
  };

  const handleScaleDragEnd = (e) => {
    console.log('Scale drag ended');
    setScalePosition({ x: e.target.x(), y: e.target.y() });
  };

  const addNewBoat = () => {
    const newId = shapes.length ? Math.max(...shapes.map(shape => shape.id)) + 1 : 1;
    console.log('Adding new boat with ID:', newId);
    setShapes([...shapes, { id: newId, x: 200, y: 200, width: 100, height: 50, color: 'purple', angle: 0 }]);
  };

  return (
    <div>
      <Stage width={794} height={1123} className="map-canvas">
        <Layer>
          <Image image={mapImage} width={794} height={1123} />
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
              x={scalePosition.x}
              y={scalePosition.y}
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
