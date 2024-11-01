// Map.jsx
import React, { useEffect, useRef, useState } from 'react';
import './../styles/Map.css'; // Ensure you have basic styles

function Map() {
  const canvasRef = useRef(null);
  const [shape, setShape] = useState({ x: 150, y: 100, width: 100, height: 50, color: 'purple', angle: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('2D context not supported.');
      return;
    }

    const img = new Image();
    img.src = '/map_for_inkscape.svg'; // The actual image of the marina map
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawShape(ctx);
    };
  }, [shape]);

  const drawShape = (ctx) => {
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
  };

  const handleKeyDown = (e) => {
    let newShape = { ...shape };
    switch (e.key) {
      case '>': // Right arrow
      case 'ArrowRight':
        newShape.x += 1;
        break;
      case '<': // Left arrow
      case 'ArrowLeft':
        newShape.x -= 1;
        break;
      case '+': // Increase size
      case '=':
        newShape.width += 1;
        newShape.height += 0.5;
        break;
      case '-':
        if (newShape.width > 1 && newShape.height > 0.5) {
          newShape.width -= 1;
          newShape.height -= 0.5;
        }
        break;
      case 'Shift':
        document.addEventListener('keydown', rotateHandler);
        break;
      default:
        break;
    }
    setShape(newShape);
  };

  const rotateHandler = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      setShape((prev) => ({ ...prev, angle: prev.angle + (e.key === 'ArrowRight' ? 1 : -1) }));
    }
    document.removeEventListener('keydown', rotateHandler);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shape]);

  const changeColor = (color) => {
    setShape({ ...shape, color });
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} tabIndex="0" className="map-canvas" />
      <div className="color-buttons">
        <button style={{ backgroundColor: 'red' }} onClick={() => changeColor('red')}>Red</button>
        <button style={{ backgroundColor: 'blue' }} onClick={() => changeColor('blue')}>Blue</button>
      </div>
    </div>
  );
}

export default Map;
