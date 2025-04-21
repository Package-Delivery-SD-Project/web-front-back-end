import React from 'react';
import { useRos } from '../../RosContext';
import { Button } from '@mui/material';

const RosEstopButton = () => {
    const { ESTOP, EstopStart, publishEstop, isConnected } = useRos();

    const handleEmergencyStop = () => {
        EstopStart();
        publishEstop(!ESTOP);

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
                justifyContent: 'center',
                background: ESTOP 
                    ? 'linear-gradient(to bottom, #cc3333, #990000)' 
                    : 'repeating-linear-gradient(45deg, #cfcf00, #cfcf00 10px, #333333 10px, #333333 20px)',
                '&:hover': {
                    background: ESTOP 
                        ? 'linear-gradient(to bottom, #dd4444, #880000)' 
                        : 'repeating-linear-gradient(45deg, #cfcf00, #cfcf00 10px, #333333 10px, #333333 20px)',
                },
                boxShadow: ESTOP 
                    ? '0 0 10px rgba(180, 0, 0, 0.5)' 
                    : '0 0 6px rgba(100, 100, 0, 0.4)',
                border: ESTOP 
                    ? '2px solid #880000' 
                    : '2px solid #333333',
            }}
        >
            <span
                style={{
                    backgroundColor: ESTOP ? '#770000' : '#333333',
                    color: '#f0f0f0',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                }}
            >
                {ESTOP ? 'ESTOP OFF' : 'ESTOP ON'}
            </span>
        </Button>
    );
};

export default RosEstopButton;
