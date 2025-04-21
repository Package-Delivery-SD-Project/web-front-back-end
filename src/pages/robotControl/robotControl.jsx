import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRos } from '../../RosContext';
import { Box, Typography, Button, useTheme, Alert, Paper, Divider } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import CameraFeed from '../../Camera';

const GamepadComponent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { TeleopEnable, currentState, publishTeleopEnable, publishJoyData } = useRos();
  
  const [errorMessage, setErrorMessage] = useState("");
  const [contentHeight, setContentHeight] = useState(0);
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  // Gamepad state management
  const [gamepadState, setGamepadState] = useState({
    controllerIndex: null,
    isConnected: false,
    isMounted: false,
    axes: [0, 0],
    lastUpdateTime: 0
  });

  const animationFrameRef = useRef(null);
  const previousAxesRef = useRef([0, 0]);
  
  const DEAD_ZONE = 0.05;
  const UPDATE_RATE = 50;

  // Calculate available height for content
  useEffect(() => {
    const updateContentHeight = () => {
      if (containerRef.current && headerRef.current) {
        const windowHeight = window.innerHeight;
        const headerHeight = headerRef.current.offsetHeight;
        const padding = 80; // Account for margins and padding
        setContentHeight(windowHeight - headerHeight - padding);
      }
    };

    updateContentHeight();
    window.addEventListener('resize', updateContentHeight);
    
    return () => {
      window.removeEventListener('resize', updateContentHeight);
    };
  }, []);

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
    // Only update gamepad if teleop is enabled and gamepad is mounted and connected
    if (!gamepadState.isMounted || !gamepadState.isConnected || !TeleopEnable) {
      // Make sure we stop sending commands if any condition is not met
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        // Send zero velocity when disabling
        publishJoyData({ linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } });
      }
      return;
    }
    
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

        previousAxesRef.current = newAxes;
        setGamepadState(prev => ({ ...prev, axes: newAxes, lastUpdateTime: now }));
        publishJoyData({
          linear: { x: newAxes[0], y: 0, z: 0 },
          angular: { x: 0, y: 0, z: newAxes[1] }
        });
      }
      animationFrameRef.current = requestAnimationFrame(updateGamepadState);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateGamepadState);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        publishJoyData({ linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } });
      }
    };
  }, [gamepadState.isMounted, gamepadState.isConnected, gamepadState.controllerIndex,
      gamepadState.lastUpdateTime, applyDeadZone, hasAxesChanged, publishJoyData, TeleopEnable]);

  const handleEnableTeleop = () => {
    // Trying to enable teleop, but not in idle state
    if (!TeleopEnable && currentState !== "idle") {
      setErrorMessage("Cannot enable teleoperation. Robot must be in the 'idle' state.");
      // Auto-hide error after 5 seconds
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
  
    // Trying to disable teleop, but not in teleop state
    if (TeleopEnable && currentState !== "teleop") {
      setErrorMessage("Cannot disable teleoperation. Robot is not in the 'teleop' state. How did you get here?");
      // Auto-hide error after 5 seconds
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    // Clear errors and toggle teleop
    setErrorMessage("");
    publishTeleopEnable(!TeleopEnable);

    // If disabling teleop, send zero velocity to ensure robot stops
    if (TeleopEnable) {
      publishJoyData({ linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } });
    }
  };

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
    <Box 
      m="20px" 
      sx={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column' }}
      ref={containerRef}
    >
      {/* Header section with clear visual separation */}
      <Paper 
        elevation={3} 
        sx={{ p: 2, mb: 3, bgcolor: colors.primary[400] }}
        ref={headerRef}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="ROBOT CONTROL" subtitle="Manual control of the robot" />

          <Button 
            variant="contained" 
            color={TeleopEnable ? "secondary" : "primary"} 
            onClick={handleEnableTeleop}
            size="large"
          >
            {TeleopEnable ? "Disable Teleop" : "Enable Teleop"}
          </Button>
        </Box>
        <Typography variant="h6" color="secondary" mt={1}>
          {TeleopEnable ? "Teleoperation Enabled" : "Teleoperation Disabled"}
        </Typography>
      </Paper>

      {/* Main Content with Grayout Effect */}
      <Box 
        sx={{ 
          opacity: TeleopEnable ? 1 : 0.5, 
          pointerEvents: TeleopEnable ? "auto" : "none",
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Content section with Camera and Controls */}
        <Box 
          display="flex" 
          flexDirection="row" 
          gap="20px" 
          justifyContent="center" 
          alignItems="flex-start" 
          width="100%"
          sx={{ height: contentHeight ? `${contentHeight}px` : 'auto' }}
        >
          {/* Camera Feed with constrained height */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              bgcolor: colors.primary[400],
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              height: '100%', 
              width: '100%', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <CameraFeed />
            </Box>
          </Paper>
          
          {/* Controls Panel */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: colors.primary[400],
              width: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}
          >
            <Typography variant="h5" color={colors.grey[100]} mb={2}>
              Controller Status
            </Typography>
            <Divider sx={{ width: '100%', mb: 2 }} />
            
            <Button 
              variant="contained" 
              sx={{ width: '100%', mb: 3, py: 1, ...getButtonStyles() }} 
              onClick={handleMount}
            >
              {getButtonText()}
            </Button>
            
            <Box display="flex" flexDirection="column" alignItems="center" width="100%">
              <Typography 
                variant="h6" 
                style={{ color: gamepadState.isConnected ? colors.greenAccent[500] : colors.redAccent[500], marginBottom: '15px' }}
              >
                {gamepadState.isConnected ? 'Controller Connected' : 'Controller Disconnected'}
              </Typography>
              
              {gamepadState.isConnected && (
                <>
                  <Divider sx={{ width: '100%', mb: 2 }} />
                  <Typography variant="h6" color={colors.grey[100]} mb={1}>
                    Current Values
                  </Typography>
                  <Box display="flex" gap="20px" justifyContent="center" width="100%" mt={1}>
                    <Box textAlign="center" sx={{ p: 1, bgcolor: colors.primary[500], borderRadius: 1, flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color={colors.grey[300]}>Linear Velocity (X)</Typography>
                      <Typography variant="h5" style={{ color: colors.blueAccent[300] }}>{gamepadState.axes[0].toFixed(2)}</Typography>
                    </Box>
                    <Box textAlign="center" sx={{ p: 1, bgcolor: colors.primary[500], borderRadius: 1, flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color={colors.grey[300]}>Angular Velocity (Z)</Typography>
                      <Typography variant="h5" style={{ color: colors.blueAccent[300] }}>{gamepadState.axes[1].toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
      
      {/* Error message as overlay */}
      {errorMessage && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 1000,
            maxWidth: '300px',
            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.2)'
          }}
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
};

export default GamepadComponent;