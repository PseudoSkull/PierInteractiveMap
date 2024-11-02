// Map.jsx
import React, { useEffect, useRef, useState } from 'react';
import './../styles/Map.css'; // Ensure you have basic styles

function Map() {
  const canvasRef = useRef(null);
  const [shapes, setShapes] = useState([{ id: 1, x: 150, y: 100, width: 100, height: 50, color: 'purple', angle: 0 }]);
  const [activeShapeId, setActiveShapeId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(5);
  const colorOptions = ['blue', 'red', 'purple', 'pink', 'green'];
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    if (!ctx) {
      console.error('2D context not supported.');
      return;
    }
  
    const img = new Image();
    img.src = '/map_for_inkscape.svg'; // Path to the image
  
    img.onload = () => {
      // Set the canvas size to a desired smaller size while maintaining the aspect ratio
      const scaleFactor = 1.2; // Adjust this value as needed to scale down
      canvas.width = img.naturalWidth * scaleFactor;
      canvas.height = img.naturalHeight * scaleFactor;
  
      // Draw the image scaled down to fit the new canvas size
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawShapes(ctx);
    };
  }, [shapes]);

  const drawShapes = (ctx) => {
    shapes.forEach(shape => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate((shape.angle * Math.PI) / 180);
      ctx.beginPath();
      ctx.ellipse(0, 0, shape.width / 2, shape.height / 2, 0, 0, 2 * Math.PI);
      ctx.fillStyle = shape.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.restore();
    });
  };

  const handleKeyDown = (e) => {
    if (activeShapeId === null) return; // Only allow control when a shape is active

    let newShapes = [...shapes];
    const activeShape = newShapes.find(shape => shape.id === activeShapeId);

    if (!activeShape) return;

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
      default:
        break;
    }
    setShapes(newShapes);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let clickedShape = null;
    shapes.forEach(shape => {
      const dx = clickX - shape.x;
      const dy = clickY - shape.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= shape.width / 2) {
        clickedShape = shape;
      }
    });

    if (clickedShape) {
      setActiveShapeId(clickedShape.id);
      setIsDragging(true);
      setDragOffset({ x: clickX - clickedShape.x, y: clickY - clickedShape.y });
    } else {
      setActiveShapeId(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || activeShapeId === null) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const moveX = e.clientX - rect.left;
    const moveY = e.clientY - rect.top;

    let newShapes = [...shapes];
    const activeShape = newShapes.find(shape => shape.id === activeShapeId);

    if (activeShape) {
      activeShape.x = moveX - dragOffset.x;
      activeShape.y = moveY - dragOffset.y;
      setShapes(newShapes);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const addNewBoat = () => {
    const newId = shapes.length ? Math.max(...shapes.map(shape => shape.id)) + 1 : 1;
    setShapes([...shapes, { id: newId, x: 200, y: 200, width: 100, height: 50, color: 'purple', angle: 0 }]);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shapes, activeShapeId, speed]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        width={800}
        height={600}
        tabIndex="0"
        className="map-canvas"
      />
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
