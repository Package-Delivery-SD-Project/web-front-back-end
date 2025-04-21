// ========================= IMPORTS =========================
import React, { useState } from "react";
import { Box, useTheme, Snackbar, Alert, TextField } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataContacts } from "../../data/mockData";
import Header from "../../components/Header";
import { useRos } from "../../RosContext";
import { Button } from "@mui/material";

// ========================= MAIN COMPONENT =========================
const Contacts = () => {
  // ========================= STATE VARIABLES =========================
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const { publishGoalPoint, publishCancelMove, publishEmail } = useRos();
  const [destinationEmail, setDestinationEmail] = useState("");

  // ========================= HANDLERS =========================
  const handleSubmit = (params) => {
    setSelectedRow(params.row);
    setIsSubmitted(true);
  };

  const handleReturnHome = () => {
    const boolMessage = { data: true };
    console.log('Published Cancel Move');
    publishCancelMove(boolMessage);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setDestinationEmail(newEmail);
    if (publishEmail) {
      publishEmail({ data: newEmail });
      console.log("tTESTINGINOKAJSDFLKJ")
    }
    
  };

  const handleConfirm = () => {
    if (selectedRow) {
      const poseMessage = {
        position: {
          x: selectedRow.poseX,
          y: selectedRow.poseY,
          z: 0.0,
        },
        orientation: {
          x: 0.0,
          y: 0.0,
          z: 0.0,
          w: 1.07,
        },
      };
      publishGoalPoint(poseMessage);
    }

    setIsConfirmed(true);
    setShowConfirmation(true);

    setTimeout(() => {
      handleReset();
    }, 500);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setIsConfirmed(false);
    setSelectedRow(null);
    setShowConfirmation(false);
  };

  const handleCloseConfirmation = (event, reason) => {
    if (reason === "clickaway") return;
    setShowConfirmation(false);
  };

  // ========================= COLUMNS FOR DATA GRID =========================
  const columns = [
    { field: "id", headerName: "Id", width: 100 },
    {
      field: "name",
      headerName: "Name",
      cellClassName: "name-column--cell",
      width: 100,
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
            backgroundColor: isSubmitted ? colors.grey[500] : theme.palette.success.main,
            color: colors.grey[100],
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: isSubmitted ? "not-allowed" : "pointer",
          }}
        >
          Submit
        </button>
      ),
    },
  ];

  // ========================= RENDER UI =========================
  return (
    <Box m="20px">
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Header title="ROUTE PLANNING" subtitle="Please select a destination" />
          </Box>

          <Box display="flex" alignItems="center" gap="10px" ml={2}>
            <TextField
              label="Destination Email"
              variant="outlined"
              type="email"
              value={destinationEmail}
              onChange={handleEmailChange}
              placeholder="Enter email"
              sx={{
                width: 250,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: colors.grey[300],
                  },
                  "&:hover fieldset": {
                    borderColor: colors.grey[100],
                  },
                },
                "& .MuiInputLabel-root": {
                  color: colors.grey[100],
                },
                "& .MuiInputBase-input": {
                  color: colors.grey[100],
                },
                backgroundColor: colors.primary[400],
              }}
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" gap="10px">
          {isSubmitted && !isConfirmed && (
            <button
              onClick={handleConfirm}
              style={{
                backgroundColor: theme.palette.success.main,
                color: colors.grey[100],
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Confirm Selection
            </button>
          )}
          {isSubmitted && !isConfirmed && (
            <button
              onClick={handleReset}
              style={{
                backgroundColor: theme.palette.error.main,
                color: colors.grey[100],
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </Box>
      </Box>

      {/* DataGrid Section */}
      <Box display="flex" justifyContent="flex-start">
        <Box
          m="8px 0 0 0"
          width="50%"
          height="80vh"
          sx={{
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { borderBottom: "none" },
            "& .name-column--cell": { color: colors.greenAccent[300] },
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
      </Box>

      {/* Snackbar Confirmation */}
      <Snackbar
        open={showConfirmation}
        autoHideDuration={3000}
        onClose={handleCloseConfirmation}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseConfirmation}
          severity="success"
          sx={{ width: "100%" }}
        >
          {selectedRow &&
            `Confirmed destination: ${selectedRow.name} on floor ${selectedRow.floor}`}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ========================= EXPORT COMPONENT =========================
export default Contacts;