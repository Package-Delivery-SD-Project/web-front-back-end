import React, { useState, useCallback, useRef } from 'react';
import ROSLIB from 'roslib';

const RosContext = React.createContext();

// Define topic configurations
const TOPICS = {
  camera: {
    name: '/usb_cam/image_raw/compressed',
    messageType: 'sensor_msgs/CompressedImage',
    type: 'subscriber',
    callback: (message, setState) => {
        try {
            const imageDataUrl = `data:image/jpeg;base64,${message.data}`;
            setState(imageDataUrl);
           
          } catch (error) {
            console.error('Error processing image message:', error);
          }
        
    }
  },
  joy: {
    name: '/package_joy',
    messageType: 'sensor_msgs/Joy',
    type: 'publisher'
  },
  goalPoint: {
    name: '/goal_point',
    messageType: 'geometry_msgs/Pose',
    type: 'publisher'
  }
  ,
  currentPoint: {
    name: '/current_point',
    messageType: 'geometry_msgs/Pose',
    type: 'subscriber'
  }

};

export const RosProvider = ({ children }) => {
    const [ros, setRos] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const rosInstanceRef = useRef(null);
    
    // State management for topics
    const [topicInstances, setTopicInstances] = useState({});
    const [topicStates, setTopicStates] = useState({
      imageSrc: '',
      // Add other topic-specific states here
    });

    const cleanup = useCallback(() => {
        console.log("Cleaning up ROS connections...");
        
        // Cleanup all subscribers
        Object.entries(topicInstances).forEach(([name, instance]) => {
            if (TOPICS[name].type === 'subscriber' && instance) {
                try {
                    instance.unsubscribe();
                    console.log(`${name} unsubscribed`);
                } catch (error) {
                    console.error(`Error unsubscribing ${name}:`, error);
                }
            }
        });

        if (rosInstanceRef.current) {
            try {
                rosInstanceRef.current.close();
                console.log("ROS connection closed");
            } catch (error) {
                console.error("Error closing ROS connection:", error);
            }
            rosInstanceRef.current = null;
        }

        setTopicInstances({});
        setIsConnected(false);
    }, []);

// Update the camera topic callback
const setupTopic = useCallback((rosInstance, topicName) => {
    const topicConfig = TOPICS[topicName];

    const topic = new ROSLIB.Topic({
      ros: rosInstance,
      name: topicConfig.name,
      messageType: topicConfig.messageType
    });

    if (topicConfig.type === 'subscriber') {
      topic.subscribe((message) => {
        console.log(`Received message on topic '${topicName}':`, message);
        if (topicName === 'camera') {
          try {
            const imageDataUrl = `data:image/jpeg;base64,${message.data}`;
            setTopicStates(prev => ({
              ...prev,
              imageSrc: imageDataUrl
            }));
          } catch (error) {
            console.error('Error processing image message:', error);
          }
        } else {
          topicConfig.callback(message, (newState) => {
            setTopicStates(prev => ({
              ...prev,
              [topicName]: newState
            }));
          });
        }
      });
    }

        setTopicInstances(prev => ({
            ...prev,
            [topicName]: topic
        }));
    }, []);

    const setupTopics = useCallback((rosInstance) => {
        if (!rosInstance) return;
        Object.keys(TOPICS).forEach(topicName => {
            setupTopic(rosInstance, topicName);
        });
    }, [setupTopic]);

    const initRos = useCallback(() => {
        console.log("Attempting Ros Connection...");

        if (rosInstanceRef.current) {
            cleanup();
            setTimeout(() => createNewConnection(), 100);
        } else {
            createNewConnection();
        }
    }, [cleanup]);

    const createNewConnection = () => {
        const rosInstance = new ROSLIB.Ros({
            url: 'ws://10.108.39.0:9090'
        });

        rosInstanceRef.current = rosInstance;
        setRos(rosInstance);

        rosInstance.on('connection', () => {
            console.log('Connected to ROS.');
            setError('');
            setIsConnected(true);
            setupTopics(rosInstance);
        });

        rosInstance.on('error', (error) => {
            console.error('Error connecting to ROS:', error);
            setError('Error connecting to ROS. Please check the connection.');
            setIsConnected(false);
        });

        rosInstance.on('close', () => {
            console.log('Connection to ROS closed.');
            setError('Connection to ROS closed.');
            setIsConnected(false);
        });
    };

    // Generic publish function
    const publish = useCallback((topicName, message) => {
        const publisher = topicInstances[topicName];
        if (publisher && TOPICS[topicName].type === 'publisher') {
            publisher.publish(new ROSLIB.Message(message));
        }
    }, [topicInstances]);

    // Specific publish functions can be created for convenience
    const publishJoyData = useCallback((axes) => {
        publish('joy', {
            axes: [axes.angular.z, axes.linear.x],
            buttons: []
        });
    }, [publish]);

    const publishGoalPoint = useCallback((pose) => {
        publish('goalPoint', pose);
    }, [publish]);

    React.useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return (
        <RosContext.Provider value={{ 
            ros,
            error,
            isConnected,
            initRos,
            publishJoyData,
            publishGoalPoint,
            publish,
            ...topicStates // Spreads all topic-specific states
        }}>
            {children}
        </RosContext.Provider>
    );
};

export const useRos = () => React.useContext(RosContext);

export default RosContext;