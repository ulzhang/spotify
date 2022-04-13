import React, { useState, useEffect } from 'react';
import 'aframe';
import { Entity } from 'aframe-react';

function LyricsUI(props) {

    const [lyrics, setLyrics] = useState([]);

    const sceneEl = document.querySelector('a-scene');

    useEffect(() => {
        console.log(props)
        _getLyrics(props.artist, props.name)
    }, [])

    useEffect(() => {
        _createLyrics(lyrics)
    }, [lyrics])

    async function _getLyrics(artist, title) {
        try {
            const lyrics = await fetch(`/getLyrics?artist=${artist}&title=${title}`)
            const json = await lyrics.json();
            setLyrics(json.lyrics.split("\n"));
        } catch (e) {
            console.error(e);
        }
    }

    function _createLine(line, index, arr) {
        const x = 0
        const y = 1.6
        const z = -6
        const yOffset = arr.length

        var newEl = document.createElement('a-text');
        newEl.setAttribute('id', "a-text-lyrics");
        newEl.setAttribute('value', line)
        newEl.setAttribute('color', "white");
        newEl.setAttribute('align', "center");
        newEl.setAttribute('position', {x: x, y: y-index, z: z});
        newEl.setAttribute('animation__001', 
        {
            'property': 'position',
            'to': {x: x, y: y-index+yOffset, z: z},
            'dur': props.duration
        });

        var planeEl = document.createElement('a-plane');
        planeEl.setAttribute('id', "a-plane-lyrics");
        planeEl.setAttribute('color', "black");
        planeEl.setAttribute('width', 7);
        planeEl.setAttribute('material', "opacity: 0.75; transparent: true");
        planeEl.setAttribute('position', {x: x, y: y-index, z: z});
        planeEl.setAttribute('animation__001', 
        {
            'property': 'position',
            'to': {x: x, y: y-index+yOffset, z: z},
            'dur': props.duration
        });

        sceneEl.appendChild(newEl)
        sceneEl.appendChild(planeEl)
        // <a-text value={lyrics} geometry="primitive:plane" position="3 0 -5" color="white"></a-text>
    }

    function _createLyrics(lyricsArray) {
        try {
            _deleteLyrics()
        }
        catch {
            //
        }
        lyricsArray.forEach(_createLine)
    }

    function _deleteLyrics() {
        var elementList = sceneEl.querySelectorAll('[id=a-text-lyrics]');
        for (var i=0; i<elementList.length; i++) {
            elementList[i].parentNode.removeChild(elementList[i]);
        }
        var elementList = sceneEl.querySelectorAll('[id=a-plane-lyrics]');
        for (var i=0; i<elementList.length; i++) {
            elementList[i].parentNode.removeChild(elementList[i]);
        }
    }


    return (<>
    </>)
}

export default LyricsUI