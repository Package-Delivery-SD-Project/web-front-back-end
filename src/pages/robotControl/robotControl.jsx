import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRos } from '../../RosContext';
import { Box, Typography, Button, useTheme } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import CameraFeed from '../../Camera';

const GamepadComponent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // State management
  const [gamepadState, setGamepadState] = useState({
    controllerIndex: null,
    isConnected: false,
    isMounted: false,
    axes: [0, 0],
    lastUpdateTime: 0
  });
  
  const animationFrameRef = useRef(null);
  const previousAxesRef = useRef([0, 0]);
  
  const { publishJoyData } = useRos();

  const DEAD_ZONE = 0.05;
  const UPDATE_RATE = 50;

  const applyDeadZone = useCallback(value => Math.abs(value) < DEAD_ZONE ? 0 : value, []);
  const hasAxesChanged = useCallback(newAxes => 
    previousAxesRef.current.some((prevValue, index) => 
      Math.abs(prevValue - newAxes[index]) >= DEAD_ZONE
    ), []
  );

  const handleGamepadConnection = useCallback((event, connected) => {
    const gamepad = event.gamepad;
    setGamepadState(prev => ({
      ...prev,
      controllerIndex: connected ? gamepad.index : null,
      isConnected: connected,
      axes: connected ? prev.axes : [0, 0]
    }));
    if (!connected) {
      publishJoyData({ linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } });
    }
  }, [publishJoyData]);

  useEffect(() => {
    if (!gamepadState.isMounted) return;
    const handleConnect = event => handleGamepadConnection(event, true);
    const handleDisconnect = event => handleGamepadConnection(event, false);
    
    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        handleGamepadConnection({ gamepad: gamepads[i] }, true);
        break;
      }
    }

    const handleBeforeUnload = () => {
      publishJoyData({ linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } });
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleDisconnect);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      publishJoyData({ linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } });
    };
  }, [gamepadState.isMounted, handleGamepadConnection, publishJoyData]);

  useEffect(() => {
    if (!gamepadState.isMounted || !gamepadState.isConnected) return;
    
    const updateGamepadState = () => {
      const now = Date.now();
      if (now - gamepadState.lastUpdateTime < UPDATE_RATE) {
        animationFrameRef.current = requestAnimationFrame(updateGamepadState);
        return;
      }
      
      const gamepad = navigator.getGamepads()[gamepadState.controllerIndex];
      if (gamepad) {
        const newAxes = [
          applyDeadZone(-gamepad.axes[1]),
          applyDeadZone(gamepad.axes[2])
        ];

        if (hasAxesChanged(newAxes)) {
          previousAxesRef.current = newAxes;
          setGamepadState(prev => ({ ...prev, axes: newAxes, lastUpdateTime: now }));
          publishJoyData({
            linear: { x: newAxes[0], y: 0, z: 0 },
            angular: { x: 0, y: 0, z: newAxes[1] }
          });
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateGamepadState);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateGamepadState);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gamepadState.isMounted, gamepadState.isConnected, gamepadState.controllerIndex, 
      gamepadState.lastUpdateTime, applyDeadZone, hasAxesChanged, publishJoyData]);

  const handleMount = () => {
    setGamepadState(prev => {
      if (prev.isMounted) {
        publishJoyData({ linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } });
        previousAxesRef.current = [0, 0];
        return { ...prev, isMounted: false, axes: [0, 0], isConnected: false, controllerIndex: null };
      }
      return { ...prev, isMounted: true };
    });
  };

  const getButtonText = () => (!gamepadState.isMounted ? "Connect Controller" : 
    gamepadState.isConnected ? "Disconnect Controller" : "Waiting for Controller... (Click to Cancel)");

  const getButtonStyles = () => (!gamepadState.isMounted ? {
    bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' }
  } : gamepadState.isConnected ? {
    bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' }
  } : {
    bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' }
  });

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Header title="ROBOT CONTROL" subtitle="Robot Teleop" />
      </Box>
      <Button variant="contained" sx={{ width: '200px', ...getButtonStyles() }} onClick={handleMount}>
        {getButtonText()}
      </Button>
      <Box display="flex" flexDirection="column" alignItems="center" mb="20px">
        <Typography variant="h6" style={{ color: gamepadState.isConnected ? colors.greenAccent[500] : colors.redAccent[500], marginBottom: '10px' }}>
          {gamepadState.isConnected ? 'Controller Connected' : 'Controller Disconnected'}
        </Typography>
        {gamepadState.isConnected && (
          <Box display="flex" gap="20px" justifyContent="center">
            <Box textAlign="center">
              <Typography variant="body1" fontWeight="bold" color={colors.grey[300]}>Linear Velocity (X)</Typography>
              <Typography variant="h6" style={{ color: colors.primary[300] }}>{gamepadState.axes[0].toFixed(2)}</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body1" fontWeight="bold" color={colors.grey[300]}>Angular Velocity (Z)</Typography>
              <Typography variant="h6" style={{ color: colors.primary[300] }}>{gamepadState.axes[1].toFixed(2)}</Typography>
            </Box>
          </Box>
        )}
      </Box>
      <Box mt="20px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" style={{ borderRadius: '8px', border: `2px solid ${colors.grey[400]}`, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', padding: '10px', backgroundColor: colors.primary[400] }}>
        <CameraFeed />
      </Box>
    </Box>
  );
};

export default GamepadComponent;
