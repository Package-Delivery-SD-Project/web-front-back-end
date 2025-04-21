import React from 'react';
import { useRos } from '../../RosContext';
import { Button } from '@mui/material';

const RosConnectionButton = () => {
    const { isConnected, initRos, ros } = useRos();

    const handleToggleConnection = () => {
        if (isConnected && ros) {
            ros.close();
            
        } else {
            initRos();
        }
    };

    return (
<Button 
    onClick={handleToggleConnection}
    variant="contained"
    sx={{
        width: '200px', // fixed width of 150px
        bgcolor: isConnected ? 'error.main' : 'success.main',
        '&:hover': {
            bgcolor: isConnected ? 'error.dark' : 'success.dark',
        }
    }}
>
    {isConnected ? 'Disconnect from Ros' : 'Connect to ROS'}
</Button>

    );
};

export default RosConnectionButton;