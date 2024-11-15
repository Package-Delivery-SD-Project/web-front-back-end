import React, { useState, useEffect, useCallback } from 'react';
import { useRos } from '../../RosContext';
import { Box, Typography, useTheme } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme"; // Import tokens for consistent theme colors

const GamepadComponent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [controllerIndex, setControllerIndex] = useState(null);
  const [axes, setAxes] = useState([0, 0]); // Focusing on Axis 1 and 2
  const [isConnected, setIsConnected] = useState(false);

  // ROS context for camera feed and joystick data
  const { imageSrc, error, publishJoyData } = useRos();
  const { initRos } = useRos();

  const handleConnectDisconnect = useCallback((event, connected) => {
    const gamepad = event.gamepad;

    if (connected) {
      setControllerIndex(gamepad.index);
      setIsConnected(true);
    } else {
      setControllerIndex(null);
      setIsConnected(false);
      setAxes([0, 0]); // Reset axes on disconnect
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
        
        // Update axes values for Axis 1 and Axis 2 only
        setAxes([gamepad.axes[1], gamepad.axes[2]]);

        const twistData = {
          linear: {
              x: gamepad.axes[1] * -1,
              y: 0,
              z: 0
          },
          angular: {
              x: 0,
              y: 0,
              z: gamepad.axes[2]
          }
        };
        publishJoyData(twistData);
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [controllerIndex, publishJoyData]);

  return (
    <Box m="20px">
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Header title="ROBOT CONTROL" subtitle="Robot Teleop" />
      </Box>

      {/* Controller Connection & Axis Values */}
      <Box display="flex" flexDirection="column" alignItems="center" mb="20px">
        <Typography
          variant="h6"
          style={{
            color: isConnected ? colors.greenAccent[500] : colors.redAccent[500],
            marginBottom: '10px',
          }}
        >
          {isConnected ? 'Controller Connected' : 'Controller Disconnected'}
        </Typography>
        
        {isConnected && (
          <Box display="flex" gap="20px" justifyContent="center">
            <Box textAlign="center">
              <Typography variant="body1" fontWeight="bold" color={colors.grey[300]}>
                Axis 1
              </Typography>
              <Typography variant="h6" style={{ color: colors.primary[300] }}>
                {axes[0].toFixed(2)*-1.00}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body1" fontWeight="bold" color={colors.grey[300]}>
                Axis 2
              </Typography>
              <Typography variant="h6" style={{ color: colors.primary[300] }}>
                {axes[1].toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ROS Camera Feed */}
      <Box
        mt="20px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{
          borderRadius: '8px',
          border: `2px solid ${colors.grey[400]}`,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          padding: '10px',
          backgroundColor: colors.primary[400],
        }}
      >
        <Typography variant="h5" style={{ color: colors.grey[100], marginBottom: '10px' }}>
          ROS Camera Feed
        </Typography>
        
        {error && <Typography color="error" textAlign="center">{error}</Typography>}
        
        <div
          style={{
            width: '660px',
            height: '500px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="ROS Camera Feed"
              width="640"
              height="480"
              style={{
                objectFit: 'cover',
                display: 'block',
                borderRadius: '8px',
              }}
            />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Typography variant="body1" style={{ color: colors.grey[300] }}>Loading image...</Typography>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: `4px solid ${colors.grey[500]}`,
                  borderTop: `4px solid ${colors.primary[100]}`,
                  borderRadius: '50%',
                  margin: '20px auto 0',
                  animation: 'spin 1s linear infinite'
                }}
              ></div>
            </div>
          )}
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Box>
    </Box>
  );
};

export default GamepadComponent;
