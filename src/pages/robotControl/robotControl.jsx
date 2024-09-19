import React, { useState, useEffect } from 'react';
import { Box, Typography } from "@mui/material";
import Header from "../../components/Header";

const RobotControl = () => {
  const [stickPositions, setStickPositions] = useState({
    'controller-b10': { x: 0, y: 0 },
    'controller-b11': { x: 0, y: 0 }
  });

  let controllerIndex = null;

  useEffect(() => {
    const handleGamepadConnected = (event) => {
      const gamepad = event.gamepad;
      controllerIndex = gamepad.index;
      console.log("connected");
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);

    const intervalId = setInterval(controllerLoop, 16); // 60fps

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      clearInterval(intervalId);
    };
  }, []);

  function updateStick(elementId, leftRightAxis, upDownAxis) {
    const multiplier = 25;
    const stickLeftRight = leftRightAxis * multiplier;
    const stickUpDown = upDownAxis * multiplier;

    const stick = document.getElementById(elementId);
    if (stick) {
      const x = Number(stick.dataset.originalXPosition);
      const y = Number(stick.dataset.originalYPosition);

      const newX = x + stickLeftRight;
      const newY = y + stickUpDown;

      stick.setAttribute("cx", newX);
      stick.setAttribute("cy", newY);

      setStickPositions(prevPositions => ({
        ...prevPositions,
        [elementId]: { x: newX.toFixed(2), y: newY.toFixed(2) }
      }));
    }
  }

  function handleSticks(axes) {
    updateStick("controller-b10", axes[0], axes[1]);
    updateStick("controller-b11", axes[2], axes[3]);
  }

  function controllerLoop() {
    if (controllerIndex !== null) {
      const gamepad = navigator.getGamepads()[controllerIndex];
      if (gamepad) {
        handleSticks(gamepad.axes);
      }
    }
  }

  return (
    <Box>
      <Header title="Robot Control" subtitle="Gamepad Stick Positions" />
      <Box display="flex" justifyContent="space-around" mt={4}>
        {Object.entries(stickPositions).map(([stickId, position]) => (
          <Box key={stickId} textAlign="center">
            <Typography variant="h6">{stickId}</Typography>
            <Typography>X: {position.x}</Typography>
            <Typography>Y: {position.y}</Typography>
          </Box>
        ))}
      </Box>
      {/* Add your SVG or canvas element here for visual representation */}
    </Box>
  );
};

export default RobotControl;