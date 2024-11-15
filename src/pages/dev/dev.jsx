import React, { useRef, useEffect, useState } from 'react';

const availableMaps = ['eng_lobby', 'floor_1st', 'floor_2nd'];
const MAX_CANVAS_HEIGHT = 'calc(100vh - 100px)'; // Leave space for UI elements

const MapCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedMap, setSelectedMap] = useState(availableMaps[0]);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  const pointOfInterest = { x: 1000, y: 1000 };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = `/maps/${selectedMap}/map.png`;

    const drawPoint = () => {
      const screenX = pointOfInterest.x * zoomLevel + panOffset.x;
      const screenY = pointOfInterest.y * zoomLevel + panOffset.y;
      
      ctx.beginPath();
      ctx.arc(screenX, screenY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      const pulseSize = 16;
      ctx.beginPath();
      ctx.arc(screenX, screenY, pulseSize, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawImage = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.drawImage(image, 0, 0, image.width, image.height);
      
      ctx.restore();
      drawPoint();
    };

    const resizeCanvas = () => {
      // Get the container's dimensions
      const rect = container.getBoundingClientRect();
      
      // Set canvas size to match container while maintaining device pixel ratio
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Scale the canvas context to counter the pixel ratio scaling
      ctx.scale(dpr, dpr);
      
      // Set canvas style dimensions to match container
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      setCanvasSize({ width: rect.width, height: rect.height });
      drawImage();
    };

    image.onload = resizeCanvas;
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [selectedMap, panOffset, zoomLevel]);

  const centerOnPoint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newPanOffset = {
      x: canvas.width / (2 * window.devicePixelRatio) - pointOfInterest.x * zoomLevel,
      y: canvas.height / (2 * window.devicePixelRatio) - pointOfInterest.y * zoomLevel
    };

    setPanOffset(newPanOffset);
  };

  const handleMapChange = (event) => {
    setSelectedMap(event.target.value);
    setZoomLevel(1);
    setTimeout(centerOnPoint, 100);
  };

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    setIsPanning(true);
    setStartPanPos({ x: clientX - panOffset.x, y: clientY - panOffset.y });
  };

  const handleMouseMove = (event) => {
    if (!isPanning) return;
    const { clientX, clientY } = event;
    setPanOffset({
      x: clientX - startPanPos.x,
      y: clientY - startPanPos.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const getMousePosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    const x = (event.clientX - rect.left - panOffset.x) / (zoomLevel * dpr);
    const y = (event.clientY - rect.top - panOffset.y) / (zoomLevel * dpr);

    const distance = Math.sqrt(
      (x - pointOfInterest.x) ** 2 + (y - pointOfInterest.y) ** 2
    );

    if (distance < 16) {
      setShowDialog(true);
    }
  };

  const handleZoomChange = (event) => {
    const newZoom = parseFloat(event.target.value);
    setZoomLevel(newZoom);
    setTimeout(centerOnPoint, 50);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar with fixed height */}
      <div className="bg-white shadow-md p-4">
        <div className="flex gap-2 items-center">
          <select 
            value={selectedMap} 
            onChange={handleMapChange}
            className="px-3 py-2 bg-white rounded border"
          >
            {availableMaps.map(map => (
              <option key={map} value={map}>
                {map.replace('_', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-sm">Zoom:</span>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.1" 
              value={zoomLevel} 
              onChange={handleZoomChange} 
              className="w-32"
            />
          </div>
          <button 
            onClick={centerOnPoint}
            className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-colors"
          >
            Center View
          </button>
        </div>
      </div>

      {/* Canvas container with remaining height */}
      <div 
        ref={containerRef} 
        className="relative flex-grow overflow-hidden"
        style={{ height: MAX_CANVAS_HEIGHT }}
      >
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          onClick={getMousePosition}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {showDialog && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded p-6 z-20">
            <h2 className="text-xl font-semibold">Point of Interest</h2>
            <p>This is a popup dialog for the point of interest.</p>
            <button 
              onClick={() => setShowDialog(false)} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapCanvas;