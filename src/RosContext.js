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
    currentState: {
      name: '/current_state',
      messageType: 'std_msgs/String',
      type: 'subscriber',
      callback: (message, setState) => {
        setState(message.data);
      }
    },
    email:{
      name: '/dest_email',
      messageType: 'std_msgs/String',
      type: 'publisher'

    },
    estop: {
      name: '/estop',
      messageType: 'std_msgs/Bool',
      type: 'publisher'
    },
    cancelMove: {
      name: '/cancel_move',
      messageType: 'std_msgs/Bool',
      type: 'publisher'
    },
    joy: {
      name: '/package_joy',
      messageType: 'sensor_msgs/Joy',
      type: 'publisher'
    },
    teleopEnable: {
      name: '/teleop_enable',
      messageType: 'std_msgs/Bool',
      type: 'publisher'
    },
    goalPoint: {
      name: '/move_base_simple/goal',
      messageType: 'geometry_msgs/PoseStamped',
      type: 'publisher'
    },
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
      const [ESTOP,setEstop] = useState(false);
      const [TeleopEnable,setTeleopEnable] = useState(false);
      const [error, setError] = useState('');
      const rosInstanceRef = useRef(null);

      const [settings, setSettingsROS] = useState({
        robotName: "Robot-1",
        maxLinearVelocity: 1.0,
        maxAngularVelocity: 0.8,
        cameraEnabled: true,
        connectionMode: "auto",
        updateFrequency: 50,
        diagnosticsLevel: "standard",
        rosbridgeIP: "10.108.36.115",
        throttleRate: 100
      });
      
    
      const [topicInstances, setTopicInstances] = useState({});
      const [topicStates, setTopicStates] = useState({
        imageSrc: '',
          currentPoint: {
            position: { x: 0, y: 0, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 }
          },
          currentState: '' // Add this line
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
      
        // Skip camera topic if cameraEnabled is false
        if (topicName === 'camera' && !settings.cameraEnabled) {
          const existingTopic = topicInstances[topicName];
          if (existingTopic) {
            try {
              existingTopic.unsubscribe();
              console.log(`${topicName} unsubscribed due to camera being disabled`);
            } catch (error) {
              console.error(`Error unsubscribing ${topicName}:`, error);
            }
          }
          return; // Skip subscribing if camera is disabled
        }
      
        rosInstance.getTopics((result) => {
          if (!result.topics.includes(topicConfig.name)) {
            console.warn(`Topic '${topicConfig.name}' does not exist or is not currently being published.`);
            return;
          }
      
          const topic = new ROSLIB.Topic({
            ros: rosInstance,
            name: topicConfig.name,
            throttle_rate: settings.throttleRate,    // Limit subscription to 10Hz (100ms)
            messageType: topicConfig.messageType
          });
      
          if (topicConfig.type === 'subscriber') {
            topic.subscribe((message) => {
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
      }, [settings.cameraEnabled, topicInstances]);
      
      

      //--------------------SET UP TOPICS --------------------


      const setupTopics = useCallback((rosInstance) => {
        if (!rosInstance) return;
        Object.keys(TOPICS).forEach(topicName => {
            if (topicName === 'camera' && !settings.cameraEnabled) {
                console.log("Camera disabled, skipping camera topic subscription");
                return;
            }
            setupTopic(rosInstance, topicName);
        });
    }, [setupTopic, settings.cameraEnabled]);
    
      
      //-------------------- ROS INIT --------------------

      const initRos = useCallback((customSettings = settings) => {
        console.log("Attempting Ros Connection...");
      
        if (rosInstanceRef.current) {
          cleanup();
          setTimeout(() => createNewConnection(customSettings), 100);
        } else {
          createNewConnection(customSettings);
        }
      }, [cleanup, settings]);
      

      

        const EstopStart = () => {
          setEstop(prev => !prev);
      };
      //--------------------CREATE NEW CONNECTION --------------------
      const createNewConnection = (currentSettings) => {
        const rosURL = `ws://${currentSettings.rosbridgeIP}:9090`;
        console.log("Connecting to:", rosURL);
      
        const connectionConfig = {
          url: rosURL,
          reconnectionTimeout: 5000,
          connectionTimeout: 10000,
          maxReconnectionAttempts: 10,
          queueSize: 100,
          transportLibrary: 'websocket'
        };
      
        const rosInstance = new ROSLIB.Ros(connectionConfig);
      
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
        console.log(`[publish] Topic: ${topicName}`);
        console.log(`[publish] Message:`, message);
        
        if (!publisher) {
            console.warn(`[publish] No publisher found for topic: ${topicName}`);
            return;
        } 
    
        if (TOPICS[topicName].type !== 'publisher') {
            console.warn(`[publish] Topic ${topicName} is not of type 'publisher'`);
            return;
        }
    
        console.log(`[publish] Publishing to ${topicName}...`);
        publisher.publish(new ROSLIB.Message(message));
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
//-------------------- PUBLISH EMAIL FUNCTION --------------------

const publishEmail = useCallback((state) => {
  console.log('[publishEmail] Called with state:', state);
  publish('email', { data: state.data });

}, [publish]);

      


      const publishEstop = useCallback((state) => {
        publish('estop', { data: state });
    }, [publish]);
    const publishGoalPoint = useCallback((pose) => {
      const goalMessage = {
        header: {
          frame_id: "map",  // or "base_link", depending on your setup
          stamp: { secs: 0, nsecs: 0 }  // optional dummy stamp
        },
        pose: {
          position: pose.position,
          orientation: pose.orientation
        }
      };
      publish('goalPoint', goalMessage);
    }, [publish]);
    
      const publishCancelMove = useCallback(() => {
        publish('cancelMove', { data: true });
        console.log("whytf this aint working lmao")
      }, [publish]);
      const publishTeleopEnable = useCallback((state) => {
        setTeleopEnable(state); // Use the state setter function
        publish('teleopEnable', { data: state });
    }, [publish]);


    const publishSettings = (newSettings) => {
      console.log("Setting new ROS settings:", newSettings);
    
      // Close current connection
      if (rosInstanceRef.current) {
        rosInstanceRef.current.close();
      }
    
      // Update settings and reconnect using the updated state
      setSettingsROS(prevSettings => {
        const updatedSettings = { ...prevSettings, ...newSettings };
        setTimeout(() => initRos(updatedSettings), 100); // Give time for state update
        return updatedSettings;
      });
    };

      React.useEffect(() => {
          return cleanup;
      }, [cleanup]);

      return (
          <RosContext.Provider value={{ 
              ros,
              error,
              isConnected,
              ESTOP,
              TeleopEnable,
              settings,

              publishSettings,
              setSettingsROS,
              EstopStart,
              initRos,
              publishJoyData,
              publishGoalPoint,
              publishEstop,
              publishCancelMove,
              publishTeleopEnable,              
              publishEmail,
              publish,
              ...topicStates // Spreads all topic-specific states
          }}>
              {children}
          </RosContext.Provider>
      );
  };



  export const useRos = () => React.useContext(RosContext);

  export default RosContext;