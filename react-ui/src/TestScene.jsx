import React, { useState, useEffect } from 'react';
// import { Entity, Scene } from 'aframe-react';
import 'aframe';


function TestScene(props) {
    return (<>
            <a-scene>
        <a-box
            color="#0095DD"
            rotation="20 40 0"
            position="0 1 0"
            animation="property: position; to: 1 8 -10; dur: 2000; easing: linear; loop: true"
            animation__2="property: rotation; to: 0 360 0; loop: true; dur: 10000">
        </a-box>
        <a-camera
            position="0 1 4"
            cursor-visible="true"
            cursor-scale="2"
            cursor-color="#0095DD"
            cursor-opacity="0.5">
        </a-camera>
        <a-light
            type="directional"
            color="#FFF"
            intensity="0.5"
            position="-1 1 2">
        </a-light>
        <a-light
            type="ambient"
            color="#FFF">
        </a-light>
        <a-entity
            geometry="
            primitive: torus;
            radius: 1;
            radiusTubular: 0.1;
            segmentsTubular: 12;"
            material="
            color: #EAEFF2;
            roughness: 0.1;
            metalness: 0.5;"
            rotation="10 0 0"
            position="-3 1 0">
        </a-entity>
        <a-entity id="mouseCursor" cursor="rayOrigin: mouse"></a-entity>
        </a-scene>
    </>)
}

export default TestScene