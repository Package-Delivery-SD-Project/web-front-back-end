import React, { useState, useEffect } from 'react';
import ROSLIB from 'roslib';

function Dev() {

    // @ts-ignore
    var ros = new ROSLIB.Ros({
        url : 'ws://10.108.39.0:9090'
    });

    // @ts-ignore
    const camera_listener = new ROSLIB.Topic({
        ros : ros,
        name : '/webcam',
        messageType : 'std_msgs/String'
    });

    useEffect(() => {
        const canvas = document.getElementById('rgb-canvas');
        if (canvas instanceof HTMLCanvasElement) {
            canvas.width = 640; // Set canvas width
            canvas.height = 480; // Set canvas height
        }
    }, []);

    camera_listener.subscribe(function(imgMes: any) {
        if (!imgMes) return;

        const canvas = document.getElementById('rgb-canvas');
        if (canvas instanceof HTMLCanvasElement) {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const image = new Image();
            image.onload = function() {
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // Fit image to canvas size
            };
            image.src = `data:image/png;base64,${imgMes.data}`;
        }
    });

    ros.on('connection', function() {
        const status = document.getElementById("status")
        if (status) status.innerHTML = "Connected";
    });

    ros.on('error', function(error) {
        console.log(error);
        const status = document.getElementById("status");
        if (status) status.innerHTML = "Error";
    });

    ros.on('close', function() {
        const status = document.getElementById("status");
        if (status) status.innerHTML = "Closed";
    });

    return (
        <div id='container'>
            <h1>Simple ROS User Interface</h1>
            <p>Connection status: <span id="status"></span></p>
            <p>Last /txt_msg received: <span id="msg"></span></p>
            <canvas id='rgb-canvas' width={640} height={480}></canvas>
        </div>
    );
}

export default Dev;
