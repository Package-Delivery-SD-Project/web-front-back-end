import React from 'react';
import { useRos } from '../../RosContext';
import { Button } from '@mui/material';

const RosEstopButton = () => {
    const { ESTOP, EstopStart, publishEstop, isConnected } = useRos();

    const handleEmergencyStop = () => {
        // Toggle the ESTOP state using EstopStart (which already calls publishEstop internally)
        EstopStart();
        
        // If you want to directly publish the ESTOP state regardless of the UI state:
        publishEstop(!ESTOP);
        
        // Log appropriate message based on connection state
        if (isConnected) {
            console.log(ESTOP ? 'ESTOP Triggered OFF' : 'ESTOP Triggered');
        } else {
            console.log(ESTOP ? 'ESTOP Triggered OFF, but connection is down!' : 'ESTOP Triggered, but connection is down!');
        }
    };

    return (
        <Button 
            onClick={handleEmergencyStop}
            variant="contained"
            sx={{
                width: '150px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                // When ESTOP is true (active), use a bright red to dark red gradient
                // When ESTOP is false, keep the success green color
                background: ESTOP 
                    ? 'linear-gradient(to bottom, #FF0000, #CC0000)'
                    : 'success.main',
                '&:hover': {
                    background: ESTOP 
                        ? 'linear-gradient(to bottom, #FF3333, #AA0000)' 
                        : 'success.dark',
                },
                boxShadow: ESTOP ? '0 0 10px rgba(255, 0, 0, 0.6)' : 'none',
                border: ESTOP ? '2px solid #880000' : 'none',
            }}
        >
            {ESTOP ? 'ESTOP OFF' : 'ESTOP ON'}
        </Button>
    );
};

export default RosEstopButton;