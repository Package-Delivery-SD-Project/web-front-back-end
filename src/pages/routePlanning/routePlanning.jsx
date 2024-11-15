import React, { useState } from "react";
import { Box, useTheme, Snackbar, Alert } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataContacts } from "../../data/mockData";
import Header from "../../components/Header";
import { useRos } from "../../RosContext"; // Add this import

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // Get the publishGoalPoint function from ROS context
  const { publishGoalPoint } = useRos();

  const handleSubmit = (params) => {
    setSelectedRow(params.row);
    setIsSubmitted(true);
  };

  const handleConfirm = () => {
    if (selectedRow) {
      // Create the pose message format that ROS expects
      const poseMessage = {
        position: {
          x: selectedRow.poseX,
          y: selectedRow.poseY,
          z: 0.0
        },
        orientation: {
          x: 0.0,
          y: 0.0,
          z: 0.0,
          w: 1.0
        }
      };

      // Publish the goal point to ROS
      publishGoalPoint(poseMessage);
    }
    
    setIsConfirmed(true);
    setShowConfirmation(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setIsConfirmed(false);
    setSelectedRow(null);
    setShowConfirmation(false);
  };

  const handleCloseConfirmation = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowConfirmation(false);
  };

  // Rest of your component code remains the same...
  const columns = [
    { field: "id", headerName: "Id", width: 100 },
    {
      field: "name",
      headerName: "Name",
      cellClassName: "name-column--cell",
      width: 200,
    },
    {
      field: "floor",
      headerName: "Floor",
      type: "number",
      headerAlign: "left",
      align: "left",
      width: 100,
    },
    {
      field: "poseX",
      headerName: "X cord",
      type: "number",
      headerAlign: "left",
      align: "left",
      width: 100,
    },
    {
      field: "poseY",
      headerName: "Y cord",
      type: "number",
      headerAlign: "left",
      align: "left",
      width: 100,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <button
          onClick={() => handleSubmit(params)}
          disabled={isSubmitted}
          style={{
            backgroundColor: isSubmitted ? colors.grey[500] : colors.blueAccent[600],
            color: colors.grey[100],
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: isSubmitted ? 'not-allowed' : 'pointer',
          }}
        >
          Submit
        </button>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="ROUTE PLANNING" subtitle="Please select a destination" />
        <Box display="flex" gap="10px">
          {isSubmitted && !isConfirmed && (
            <button
              onClick={handleConfirm}
              style={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Confirm Selection
            </button>
          )}
          {(isSubmitted || isConfirmed) && (
            <button
              onClick={handleReset}
              style={{
                backgroundColor: colors.redAccent[600],
                color: colors.grey[100],
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          )}
        </Box>
      </Box>
      <Box
        m="8px 0 0 0"
        width="100%"
        height="80vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={mockDataContacts}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      <Snackbar 
        open={showConfirmation} 
        autoHideDuration={3000} 
        onClose={handleCloseConfirmation}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseConfirmation} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {selectedRow && `Confirmed destination: ${selectedRow.name} on floor ${selectedRow.floor}`}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contacts;