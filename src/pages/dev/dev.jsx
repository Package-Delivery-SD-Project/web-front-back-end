import React, { useRef, useEffect, useState } from 'react';


// Usage example in your main app:
import { useRos } from '../../RosContext';
import CameraFeed from '../../Camera';

const Camera = () => {
  return (
    <useRos>
      <div className="app">
        <h1>Robot Camera View</h1>
        <CameraFeed />
      </div>
    </useRos>
  );
};

export default Camera