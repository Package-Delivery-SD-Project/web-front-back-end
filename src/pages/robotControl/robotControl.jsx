import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRos } from '../../RosContext';
import { Box, Typography, Button, useTheme, Alert } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import CameraFeed from '../../Camera';

const GamepadComponent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { teleopEnable, currentState, setTeleopEnable } = useRos();
  
  const [errorMessage, setErrorMessage] = useState("");

  const handleEnableTeleop = () => {
    if (currentState !== "idle") {
      setErrorMessage("Cannot enable teleoperation. Robot is not in idle state.");
      return;
    }
    setErrorMessage("");
    setTeleopEnable(true);
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Header title="ROBOT CONTROL" subtitle="Robot Teleop" />
      </Box>

      {/* Teleop Enable Button */}
      {!teleopEnable && (
        <Box mb="20px" display="flex" flexDirection="column" alignItems="center">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleEnableTeleop}
          >
            Enable Teleop
          </Button>
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Box>
      )}

      {/* Main Content with Grayout Effect */}
      <Box 
        sx={{ 
          opacity: teleopEnable ? 1 : 0.5, 
          pointerEvents: teleopEnable ? "auto" : "none"
        }}
      >
        <Typography variant="h6" color="primary">
          {teleopEnable ? "Teleoperation Enabled" : "Teleoperation Disabled"}
        </Typography>

        <Box mt="20px">
          <CameraFeed />
        </Box>
      </Box>
    </Box>
  );
};

export default GamepadComponent;
