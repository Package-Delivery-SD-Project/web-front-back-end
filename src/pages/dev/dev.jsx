import React, { useRef, useEffect, useState } from 'react';

const availableMaps = ['eng_lobby', 'floor_1st', 'floor_2nd'];

const MapCanvas = () => {
  const canvasRef = useRef(null);
  const [selectedMap, setSelectedMap] = useState(availableMaps[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.src = `/maps/${selectedMap}/map.png`;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    image.onload = resizeCanvas;
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [selectedMap]);

  const handleMapChange = (event) => {
    setSelectedMap(event.target.value);
  };

  const getMousePosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log("Coordinate x: " + x, "Coordinate y: " + y);
  };

  return (
    <div>
      <select value={selectedMap} onChange={handleMapChange}>
        {availableMaps.map(map => (
          <option key={map} value={map}>
            {map.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </option>
        ))}
      </select>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100vh' }} 
        onClick={getMousePosition}
      />
    </div>
  );
};

export default MapCanvas;