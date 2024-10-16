import React, { useState, useEffect, useCallback } from 'react';
import { useRos } from '../../RosContext'; // Import the useRos hook

const GamepadComponent = () => {
  const [controllerIndex, setControllerIndex] = useState(null);
  const [axes, setAxes] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Use the RosContext to get the camera feed and publishJoyData function
  const { imageSrc, error, publishJoyData } = useRos();

  const handleConnectDisconnect = useCallback((event, connected) => {
    const gamepad = event.gamepad;
    console.log(gamepad);

    if (connected) {
      setControllerIndex(gamepad.index);
      setIsConnected(true);
      setAxes(gamepad.axes.map(() => 0));
    } else {
      setControllerIndex(null);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    const handleConnect = (event) => handleConnectDisconnect(event, true);
    const handleDisconnect = (event) => handleConnectDisconnect(event, false);

    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleDisconnect);
    };
  }, [handleConnectDisconnect]);

  useEffect(() => {
    let animationFrameId;

    const gameLoop = () => {
      if (controllerIndex !== null) {
        const gamepad = navigator.getGamepads()[controllerIndex];
        
        setAxes(gamepad.axes);

        // Prepare Twist message data
        const twistData = {
          linear: {
              x: gamepad.axes[1]*-1, // Left stick up/down
              y: 0, // Left stick left/right
              z: 0 // Not used, set to 0
          },
          angular: {
              x: 0, // Not used, set to 0
              y: 0, // Not used, set to 0
              z: gamepad.axes[2] // Right stick left/right for rotation
          }
      };
      

      publishJoyData(twistData);  // Publish to ROS using the corrected data context function
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [controllerIndex, publishJoyData]);

  const AxisComponent = ({ index, value }) => (
    <div id={`axis-${index}`} className='axis'>
      <div className='axis-name'>AXIS {index}</div>
      <div className='axis-value'>{value.toFixed(4)}</div>
    </div>
  );

  return (
    <div>
      <h1>Manual Teleop</h1>
      <div id="controller-not-connected-area" style={{ display: isConnected ? 'none' : 'block' }}>
        Controller not connected
      </div>
      
      <div id="controller-connected-area" style={{ display: isConnected ? 'block' : 'none' }}>
        <h2>Controller Connected</h2>
        <div id="axes">
          {axes.map((value, index) => (
            <AxisComponent key={index} index={index} value={value} />
          ))}
        </div>
      </div>

      {/* Camera Feed Display */}
      <div>
        <h2>ROS Camera Feed</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {imageSrc ? (
          <img src={imageSrc} alt="ROS Camera Feed" width="640" height="480" />
        ) : (
          <p>Loading image...</p>
        )}
      </div>
    </div>
  );
};

export default GamepadComponent;