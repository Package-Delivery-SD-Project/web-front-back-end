import React, { useState, useEffect, useCallback, useRef } from 'react';
import ROSLIB from 'roslib';

const RosContext = React.createContext();

export const RosProvider = ({ children }) => {
    const [ros, setRos] = useState(null);
    const [cameraListener, setCameraListener] = useState(null);
    const [imageSrc, setImageSrc] = useState('');
    const [error, setError] = useState('');
    const [joyPublisher, setJoyPublisher] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [wasConnected, setWasConnected] = useState(false);
    const disconnectTimeRef = useRef(null);

    const TIMEOUT_LIMIT = 30000; // 30 seconds limit for disconnection warning

    // Load the connection status from sessionStorage on component mount
    useEffect(() => {
        const savedConnection = sessionStorage.getItem('rosConnection');
        if (savedConnection === 'connected') {
            setIsConnected(true);
            setWasConnected(true);
        }
    }, []);

    const initRos = useCallback(() => {
        const rosInstance = new ROSLIB.Ros({
            url: 'ws://10.108.39.0:9090' // Change this to your ROS bridge WebSocket URL
        });
        setTimeout(500);

        rosInstance.on('connection', () => {
            console.log('Connected to ROS.');
            setError('');
            setIsConnected(true);
            setWasConnected(true);
            disconnectTimeRef.current = null; // Reset disconnection time
            sessionStorage.setItem('rosConnection', 'connected'); // Persist connection state
        });

        rosInstance.on('error', (error) => {
            console.error('Error connecting to ROS:', error);
            setError('Error connecting to ROS. Please check the connection.');
            setIsConnected(false);
            sessionStorage.setItem('rosConnection', 'disconnected'); // Persist disconnection state
        });

        rosInstance.on('close', () => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Connection to ROS closed.`);
            setError(`[${timestamp}] Connection to ROS closed.`);
            setIsConnected(false);
            sessionStorage.setItem('rosConnection', 'disconnected'); // Persist disconnection state
        
            if (wasConnected && !disconnectTimeRef.current) {
                disconnectTimeRef.current = Date.now(); // Store the time when the disconnection first occurred
                console.log(`[${timestamp}] Disconnect time set: ${disconnectTimeRef.current}`);
            } else if (wasConnected && disconnectTimeRef.current) {
                console.log(`[${timestamp}] Already disconnected, reconnect attempt will be initiated.`);
            } else {
                console.log(`[${timestamp}] ROS was not connected before, so no reconnection attempt.`);
            }
        });
        

        setRos(rosInstance);

        const listener = new ROSLIB.Topic({
            ros: rosInstance,
            name: '/usb_cam/image_raw/compressed',
            messageType: 'sensor_msgs/CompressedImage'
        });

        listener.subscribe((message) => {
            try {
                const imageDataUrl = `data:image/jpeg;base64,${message.data}`;
                setImageSrc(imageDataUrl);
            } catch (error) {
                console.error('Error processing image message:', error);
            }
        });

        setCameraListener(listener);

        const joyPublisherInstance = new ROSLIB.Topic({
            ros: rosInstance,
            name: '/hello_world',
            messageType: 'geometry_msgs/Twist'
        });

        setJoyPublisher(joyPublisherInstance);

        return () => {
            listener.unsubscribe();
            rosInstance.close();
        };
    }, [wasConnected]);

    // Reconnect logic
    useEffect(() => {
        let reconnectTimeout;

        const tryReconnect = () => {
            if (!isConnected) {
                console.log('Attempting to reconnect to ROS...');
                
                // Clean up the previous ROS instance if it exists
                if (ros) {
                    console.log('cleaning up ros');
                    ros.close();
                    setRos(null);
                }
        
                // Re-initialize the ROS connection
                initRos(); 
            }
        };
        

        if (!isConnected) {
            reconnectTimeout = setTimeout(tryReconnect, 5000); // Retry every 5 seconds if not connected
        }

        return () => clearTimeout(reconnectTimeout);
    }, [isConnected, initRos]);

    // Check for disconnection time and log if it exceeds the time limit
    useEffect(() => {
        let disconnectCheckInterval;

        if (!isConnected && wasConnected) {
            disconnectCheckInterval = setInterval(() => {
                if (disconnectTimeRef.current && (Date.now() - disconnectTimeRef.current > TIMEOUT_LIMIT)) {
                    console.warn(`Disconnected from ROS for over ${TIMEOUT_LIMIT / 1000} seconds.`);
                    clearInterval(disconnectCheckInterval);
                }
            }, 1000);
        }

        return () => clearInterval(disconnectCheckInterval);
    }, [isConnected, wasConnected]);

    useEffect(() => {
        const cleanup = initRos();
        return cleanup;
    }, [initRos]);

    useEffect(() => {
        if (ros) {
            const interval = setInterval(() => {
                ros.callOnConnection(() => {
                    console.log('Ping sent to check WebSocket connection.');
                });
            }, 5000); // Send ping every 5 seconds
    
            return () => clearInterval(interval);
        }
    }, [ros]);
    

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (ros && ros.isConnected !== isConnected) {
                setIsConnected(ros.isConnected);
            }
        }, 1000);
    
        return () => clearInterval(intervalId);
    }, [ros, isConnected]);
    

    const publishJoyData = useCallback((axes) => {
        const msg = new ROSLIB.Message({
            linear: {
                x: axes.linear.x, 
                y: axes.linear.y, 
                z: axes.linear.z || 0
            },
            angular: {
                x: 0,
                y: 0,
                z: axes.angular.z
            }
        });
        joyPublisher?.publish(msg);
    }, [joyPublisher]);

    return (
        <RosContext.Provider value={{ ros, cameraListener, imageSrc, error, initRos, publishJoyData }}>
            {children}
        </RosContext.Provider>
    );
};

export const useRos = () => React.useContext(RosContext);

export default RosContext;
