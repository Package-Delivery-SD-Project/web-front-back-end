import React, { useState, useEffect, useRef } from 'react';
import { useRos } from "../../RosContext";

import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  Alert, 
  Paper, 
  Divider,
  Switch,
  TextField,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider
} from "@mui/material";
import Header from "../../components/Header";

// Hardcoded colors object to avoid theme-related errors
const COLORS = {
  primary: {
    400: '#1F2A40',
    500: '#141b2d'
  },
  grey: {
    100: '#e0e0e0',
    700: '#404040',
    800: '#303030'
  },
  blueAccent: {
    400: '#2196f3',
    500: '#1976d2',
    700: '#0d47a1',
    800: '#0a3880'
  },
  greenAccent: {
    500: '#4caf50'
  },
  redAccent: {
    500: '#f44336'
  },
  orangeAccent: {
    500: '#ff9800'
  }
};

const SettingsComponent = () => {


  const { currentState, publishSettings } = useRos();
  
  const [errorMessage, setErrorMessage] = useState("");
  const [contentHeight, setContentHeight] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  // Settings state management
  const [settings, setSettings] = useState({
    robotName: "Robot-1",
    maxLinearVelocity: 1.0,
    maxAngularVelocity: 0.8,
    cameraEnabled: true,
    connectionMode: "auto",
    updateFrequency: 50,
    diagnosticsLevel: "standard",
    rosbridgeIP: "10.108.36.115",
    homeX: 0.0,
    homeY: 0.0,
    homeZ: 0.0 // floor
  });

  // Track if settings have been modified
  const [settingsModified, setSettingsModified] = useState(false);

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

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setSettingsModified(true);
  };

  const handleSaveSettings = () => {
    try {
      // Validate settings
      if (settings.maxLinearVelocity <= 0 || settings.maxLinearVelocity > 2.0) {
        throw new Error("Linear velocity must be between 0 and 2.0 m/s");
      }
      
      if (settings.maxAngularVelocity <= 0 || settings.maxAngularVelocity > 1.5) {
        throw new Error("Angular velocity must be between 0 and 1.5 rad/s");
      }
      
      if (!settings.robotName.trim()) {
        throw new Error("Robot name cannot be empty");
      }

      console.log("Saving settings")
      // If we got here, validation passed
      publishSettings(settings);
      setSettingsModified(false);
      
      // Show success message
      setSuccessMessage("Settings saved successfully");
      setTimeout(() => setSuccessMessage(""), 5000);
      
    } catch (error) {
      // Show error message
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleResetToDefaults = () => {
    // Reset to default settings
    setSettings({
      robotName: "Robot-1",
      maxLinearVelocity: 1.0,
      maxAngularVelocity: 0.8,
      cameraEnabled: true,
      connectionMode: "auto",
      updateFrequency: 50,
      diagnosticsLevel: "standard",
      rosbridgeIP: "10.108.36.115" // Make sure to include this to match the initial state
    });
    setSettingsModified(true);
  };

  return (
    <Box 
      m="20px" 
      sx={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column' }}
      ref={containerRef}
    >
      {/* Header section with clear visual separation */}
      <Paper 
        elevation={3} 
        sx={{ p: 2, mb: 3, bgcolor: COLORS.primary[400] }}
        ref={headerRef}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Header title="SETTINGS" subtitle="Configure robot parameters" />

          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveSettings}
            size="large"
            disabled={!settingsModified || currentState === "teleop"}
          >
            Save Settings
          </Button>
        </Box>
        <Typography variant="h6" color="secondary" mt={1}>
          {currentState === "teleop" ? "Cannot modify settings while in teleop mode" : ""}
        </Typography>
      </Paper>

      {/* Main Content */}
      <Box 
        sx={{ 
          opacity: currentState === "teleop" ? 0.5 : 1, 
          pointerEvents: currentState === "teleop" ? "none" : "auto",
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Content section */}
        <Box 
          display="flex" 
          flexDirection="row" 
          gap="20px" 
          justifyContent="center" 
          alignItems="flex-start" 
          width="100%"
          sx={{ height: contentHeight ? `${contentHeight}px` : 'auto' }}
        >
          {/* Main Settings Panel */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: COLORS.primary[400],
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              overflow: 'auto'
            }}
          >
            <Typography variant="h5" color={COLORS.grey[100]} mb={2}>
              General Settings
            </Typography>
            <Divider sx={{ width: '100%', mb: 3 }} />
            
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4} mb={4}>
            <TextField
                label="RosBridge IP"
                variant="outlined"
                fullWidth
                value={settings.rosbridgeIP}
                onChange={(e) => handleSettingChange('rosbridgeIP', e.target.value)} // ✅ Corrected
                sx={{ bgcolor: COLORS.primary[500], borderRadius: 1 }}
            />

              
              <FormControl fullWidth>
                <InputLabel>Connection Mode</InputLabel>
                <Select
                  value={settings.connectionMode}
                  label="Connection Mode"
                  onChange={(e) => handleSettingChange('connectionMode', e.target.value)}
                  sx={{ bgcolor: COLORS.primary[500], borderRadius: 1 }}
                >
                  <MenuItem value="auto">Automatic</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="fallback">Fallback</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Typography variant="h5" color={COLORS.grey[100]} mb={2}>
              Performance Settings
            </Typography>
            <Divider sx={{ width: '100%', mb: 3 }} />
            
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4} mb={4}>
            <Box>
    <Typography id="linear-velocity-slider" gutterBottom sx={{ color: COLORS.grey[700] }}>
      Max Linear Velocity (m/s): {settings.maxLinearVelocity.toFixed(2)}
    </Typography>
    <Slider
      aria-labelledby="linear-velocity-slider"
      value={settings.maxLinearVelocity}
      onChange={(_, newValue) => {/* No change - disabled */}}
      min={0.1}
      max={2.0}
      step={0.1}
      disabled={true}
      sx={{ color: COLORS.grey[700], opacity: 0.6 }}
    />
  </Box>
              
  <Box>
    <Typography id="linear-velocity-slider" gutterBottom sx={{ color: COLORS.grey[700] }}>
      Max Linear Velocity (m/s): {settings.maxLinearVelocity.toFixed(2)}
    </Typography>
    <Slider
      aria-labelledby="linear-velocity-slider"
      value={settings.maxLinearVelocity}
      onChange={(_, newValue) => {/* No change - disabled */}}
      min={0.1}
      max={2.0}
      step={0.1}
      disabled={true}
      sx={{ color: COLORS.grey[700], opacity: 0.6 }}
    />
  </Box>
            </Box>
            
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4} mb={4}>
              <Box>
                <Typography id="update-frequency-slider" gutterBottom>
                  Update Frequency (Hz): {settings.updateFrequency}
                </Typography>
                <Slider
                  aria-labelledby="update-frequency-slider"
                  value={settings.updateFrequency}
                  onChange={(_, newValue) => handleSettingChange('updateFrequency', newValue)}
                  min={10}
                  max={100}
                  step={5}
                  sx={{ color: COLORS.blueAccent[400] }}
                />
              </Box>
              
              <FormControl fullWidth>
                <InputLabel>Diagnostics Level</InputLabel>
                <Select
                  value={settings.diagnosticsLevel}
                  label="Diagnostics Level"
                  onChange={(e) => handleSettingChange('diagnosticsLevel', e.target.value)}
                  sx={{ bgcolor: COLORS.primary[500], borderRadius: 1 }}
                >
                  <MenuItem value="minimal">Minimal</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="verbose">Verbose</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Typography variant="h5" color={COLORS.grey[100]} mb={2}>
  Home Point Settings
</Typography>
<Divider sx={{ width: '100%', mb: 3 }} />

<Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={4} mb={4}>
  <TextField
    label="X Position"
    variant="outlined"
    fullWidth
    type="number"
    value={settings.homeX || 0}
    onChange={(e) => handleSettingChange('homeX', parseFloat(e.target.value))}
    sx={{ bgcolor: COLORS.primary[500], borderRadius: 1 }}
  />
  <TextField
    label="Y Position"
    variant="outlined"
    fullWidth
    type="number"
    value={settings.homeY || 0}
    onChange={(e) => handleSettingChange('homeY', parseFloat(e.target.value))}
    sx={{ bgcolor: COLORS.primary[500], borderRadius: 1 }}
  />
  <TextField
    label="Floor (Z)"
    variant="outlined"
    fullWidth
    type="number"
    value={settings.homeZ || 0}
    onChange={(e) => handleSettingChange('homeZ', parseFloat(e.target.value))}
    sx={{ bgcolor: COLORS.primary[500], borderRadius: 1 }}
  />
</Box>

            <Divider sx={{ width: '100%', mb: 3 }} />
            
    
              
          </Paper>
          
          {/* Side Panel */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: COLORS.primary[400],
              width: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}
          >
            <Typography variant="h5" color={COLORS.grey[100]} mb={2}>
              Actions
            </Typography>
            <Divider sx={{ width: '100%', mb: 3 }} />
            
            <Button 
              variant="contained" 
              sx={{ width: '100%', mb: 2, py: 1, bgcolor: COLORS.blueAccent[700], '&:hover': { bgcolor: COLORS.blueAccent[800] } }} 
              onClick={handleSaveSettings}
              disabled={!settingsModified}
            >
              Save Settings
            </Button>
            
            <Button 
              variant="contained" 
              sx={{ width: '100%', mb: 3, py: 1, bgcolor: COLORS.grey[700], '&:hover': { bgcolor: COLORS.grey[800] } }} 
              onClick={handleResetToDefaults}
            >
              Reset to Defaults
            </Button>
            
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="h6" color={COLORS.grey[100]} mb={2}>
                System Status
              </Typography>
              <Divider sx={{ width: '100%', mb: 2 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body1">Robot State:</Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: currentState === "idle" ? COLORS.greenAccent[500] : 
                           currentState === "teleop" ? COLORS.blueAccent[500] : 
                           COLORS.redAccent[500]
                  }}
                >
                  {currentState?.toUpperCase() || "UNKNOWN"}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body1">Settings Status:</Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: settingsModified ? COLORS.orangeAccent[500] : COLORS.greenAccent[500]
                  }}
                >
                  {settingsModified ? "MODIFIED" : "SAVED"}
                </Typography>
              </Box>
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
      
      {/* Success message as overlay */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 1000,
            maxWidth: '300px',
            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.2)'
          }}
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}
    </Box>
  );
};

export default SettingsComponent;