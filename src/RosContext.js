  import React, { useState, useCallback, useRef } from 'react';
  import ROSLIB from 'roslib';

  const RosContext = React.createContext();

  // Define topic configurations
  const TOPICS = {
    camera: {
      name: '/camera/color/image_compressed/compressed',
      messageType: 'sensor_msgs/CompressedImage', 
      type: 'subscriber',
      callback: (message, setState) => {
        // CompressedImage comes with base64 encoded data
        setState(`data:image/jpeg;base64,${message.data}`);
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
      type: 'subscriber',
      callback: (message, setState) => {
        // Access position and orientation from the Pose message
        const { position, orientation } = message;
        setState({ position, orientation });
      }
    }
    

  };

  export const RosProvider = ({ children }) => {
      const [ros, setRos] = useState(null);
      const [isConnected, setIsConnected] = useState(false);
      const [error, setError] = useState('');
      const rosInstanceRef = useRef(null);
      
    
      const [topicInstances, setTopicInstances] = useState({});
      const [topicStates, setTopicStates] = useState({
        imageSrc: '',
          currentPoint: {
            position: { x: 0, y: 0, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 }
          },
      
      });

      //--------------------CLEAN UP FUNCTION--------------------

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


      //--------------------SET UP TOPIC --------------------
      const setupTopic = useCallback((rosInstance, topicName) => {
        const topicConfig = TOPICS[topicName];
      
        rosInstance.getTopics((result) => {
          if (!result.topics.includes(topicConfig.name)) {
            console.warn(`Topic '${topicConfig.name}' does not exist or is not currently being published.`);
            return;
          }
      
          const topic = new ROSLIB.Topic({
            ros: rosInstance,
            name: topicConfig.name,
            messageType: topicConfig.messageType,
          });
      
          if (topicConfig.type === 'subscriber') {
            topic.subscribe((message) => {
            // console.log(`Received message on topic '${topicName}':`, message);

                topicConfig.callback(message, (newState) => {
                  setTopicStates((prev) => ({
                    ...prev,
                    [topicName]: newState,
                  }));
                });
              
            });
          }
      
          setTopicInstances((prev) => ({
            ...prev,
            [topicName]: topic,
          }));
        });
      }, []);
      

      //--------------------SET UP TOPICS --------------------


      const setupTopics = useCallback((rosInstance) => {
          if (!rosInstance) return;
          Object.keys(TOPICS).forEach(topicName => {
              setupTopic(rosInstance, topicName);
          });
      }, [setupTopic]);
      
      //-------------------- ROS INIT --------------------

      const initRos = useCallback(() => {
          console.log("Attempting Ros Connection...");

          if (rosInstanceRef.current) {
              cleanup();
              setTimeout(() => createNewConnection(), 100);
          } else {
              createNewConnection();
          }
      }, [cleanup]);

      //--------------------CREATE NEW CONNECTION --------------------

      const createNewConnection = () => {
          const rosInstance = new ROSLIB.Ros({
              url: 'ws://10.108.35.232:9090'
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


      //-------------------- GENERIC PUBLISH FUNCTION --------------------

      const publish = useCallback((topicName, message) => {
          const publisher = topicInstances[topicName];
          if (publisher && TOPICS[topicName].type === 'publisher') {
              publisher.publish(new ROSLIB.Message(message));
          }
      }, [topicInstances]);

      //-------------------- PUBLISH JOY DATA FUNCTION --------------------

      const publishJoyData = useCallback((axes) => {
        console.log('Publishing joystick data:', {
          axes: [axes.angular.z, axes.linear.x],
          buttons: []
      });  // Log the joystick data being published
          publish('joy', {
              axes: [axes.angular.z, axes.linear.x],
              buttons: []
          });
      }, [publish]);

      //-------------------- PUBLISH GOAL POINT FUNCTION --------------------


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