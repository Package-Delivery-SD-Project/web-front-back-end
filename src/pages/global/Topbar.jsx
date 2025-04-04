import React, { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { useTheme, Box, IconButton, Typography } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useProSidebar } from "react-pro-sidebar";
import { useRos } from '../../RosContext';
import RosConnectionButton from './rosButtonConnection';
import EstopButton from './rosButtonEstop';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { toggleSidebar, broken, rtl } = useProSidebar();
  const { currentPoint, currentState, isConnected } = useRos(); // Added currentState

  const { position = {}, orientation = {} } = currentPoint || {};
  const { x = 0, y = 0, z = 0 } = position;

  const yaw = Math.atan2(2 * (orientation.w * orientation.z + orientation.x * orientation.y), 
                         1 - 2 * (orientation.y * orientation.y + orientation.z * orientation.z)).toFixed(2);

  // Box styles to match height
  const boxStyles = {
    borderRadius: '8px',
    border: `2px solid ${isConnected ? colors.primary[500] : colors.grey[700]}`,
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
    padding: '15px 25px',
    backgroundColor: isConnected ? colors.primary[500] : colors.grey[800],
    opacity: isConnected ? 1 : 0.8,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    height: "48px",
  };

  const textColor = isConnected ? colors.grey[100] : colors.grey[300];

  return (
    <Box display="flex" justifyContent="space-between" p={2} sx={{ position: 'relative', zIndex: 1, backgroundColor: colors.primary[400] }}>
      {/* Left Section */}
      <Box display="flex" alignItems="center" gap={2}>
        {broken && !rtl && (
          <IconButton sx={{ margin: "0 6px 0 2px" }} onClick={toggleSidebar}>
            <MenuOutlinedIcon />
          </IconButton>
        )}
        <Box sx={boxStyles}>
          <Typography variant="h6" sx={{ color: textColor, marginRight: "8px" }}>
            Current Point
          </Typography>
          <Typography variant="body1" sx={{ color: textColor }}>
            <strong>X:</strong> {x.toFixed(2)}, <strong>Y:</strong> {y.toFixed(2)}, <strong>Floor:</strong> {Math.round(z)}, <strong>Rotation:</strong> {yaw} rad
          </Typography>
        </Box>
        
        {/* Added Current State Box */}
        <Box sx={boxStyles}>
          <Typography variant="h6" sx={{ color: textColor, marginRight: "8px" }}>
            Current State
          </Typography>
          <Typography variant="body1" sx={{ color: textColor }}>
            {currentState || 'Unknown'}
          </Typography>
        </Box>
      </Box>

      {/* Right Section (Aligned) */}
      <Box display="flex" alignItems="center" gap={1}>
        <Box display="flex" alignItems="center" height="48px">
          <EstopButton /> {/* Emergency Stop Button */}
        </Box>
        <Box display="flex" alignItems="center" height="48px">
          <RosConnectionButton />
        </Box>

        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <LightModeOutlinedIcon />
          ) : (
            <DarkModeOutlinedIcon />
          )}
        </IconButton>
        {broken && rtl && (
          <IconButton sx={{ margin: "0 6px 0 2px" }} onClick={toggleSidebar}>
            <MenuOutlinedIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default Topbar;