import React from 'react';
import { useRos } from './RosContext';  // adjust path as needed
import { Box } from "@mui/material";  // Import Box from MUI to match your styling

const CameraFeed = () => {
  const { camera, isConnected, error } = useRos();

  if (!isConnected) {
    return <Box sx={{ width: '100%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Not connected to ROS</Box>;
  }

  if (error) {
    return <Box sx={{ width: '100%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Error: {error}</Box>;
  }

  if (!camera) {
    return <Box sx={{ width: '100%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Waiting for camera feed...</Box>;
  }

  return (
    <Box className="camera-feed" sx={{ width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <h2>Camera Feed</h2>
      <Box sx={{ overflow: 'hidden' }}>
        <img 
          src={camera} 
          alt="ROS Camera Feed"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',  // Changed from 'cover' to 'contain'
            border: '1px solid #ccc'
          }}
        />
      </Box>
    </Box>
  );
};

export default CameraFeed;