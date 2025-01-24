// Then create a new component to display the camera feed:
import React from 'react';
import { useRos } from './RosContext';  // adjust path as needed

const CameraFeed = () => {
  const { camera, isConnected, error } = useRos();

  if (!isConnected) {
    return <div>Not connected to ROS</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!camera) {
    return <div>Waiting for camera feed...</div>;
  }

  return (
    <div className="camera-feed">
      <h2>Camera Feed</h2>
      <img 
        src={camera} 
        alt="ROS Camera Feed"
        style={{
          maxWidth: '100%',
          height: 'auto',
          border: '1px solid #ccc'
        }}
      />
    </div>
  );
};

export default CameraFeed;