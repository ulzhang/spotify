import React, { useState, useEffect } from 'react';
import 'aframe';
import { Entity, Scene } from 'aframe-react';
import 'aframe-event-set-component';
import LyricsUI from './LyricsUI';

let deviceId = '';

function SpotifyUI(props) {

    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState({});

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'VR Playback SDK',
                getOAuthToken: cb => { cb(props.token); },
                volume: 1.0
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', ( state => {
                
                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });

            }));

            player.on('ready', function (data) {
                deviceId = data.device_id;
                setTimeout(() => {
                console.log("on:"+props.token)
                  fetch('https://api.spotify.com/v1/me/player', {
                    method: "PUT",
                    body: JSON.stringify({
                      device_ids:[
                        data.device_id
                      ],
                      play: true
                    }),
                    headers: {
                      'Authorization': `Bearer ${props.token}`
                    }
                  }).catch(e => console.error(e));
                }, 100);
              });
            player.connect();
        };
    }, []);


    function _prevTrack() {
        player.previousTrack()
    }

    function _toggleTrack() {
        player.togglePlay()
    }

    function _nextTrack() {
        player.nextTrack()
    }


    if (!is_active) { 
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance not active. Transfer your playback using your Spotify app </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <a-scene>
                    <a-assets>
                        {/* <img id="floor" src={floor} /> */}
                    </a-assets>
                    <a-sky color="#222222"></a-sky>
                    {/* <a-plane material="src:#floor; repeat: 700 700; transparent: true;" height="500" width="500" rotation="-90 0 0"></a-plane> */}
                    <a-camera>
                            <a-cursor></a-cursor>
                    </a-camera>
                    {/* <Entity 
                        primitive='a-plane' 
                        color="red" 
                        position="-3 0.5 -5" 
                        class="clickable"
                        events={{click: _prevTrack}} 
                        event-set__mouseenter="scale: 1.2 1.2 1"
                        event-set__mouseleave="scale: 1 1 1"                        
                    />  */}
                    <Entity 
                        primitive='a-plane' 
                        color="gray" 
                        position="-1.1 -0.5 -3" 
                        class="clickable"
                        events={{click: _prevTrack}} 
                        event-set__mouseenter="scale: 1.2 1.2 1"
                        event-set__mouseleave="scale: 1 1 1"                          
                    ><a-text value="<<" align="center" /></Entity>
                    <Entity 
                        primitive='a-plane' 
                        color="green"
                        position="0 -0.5 -3" 
                        class="clickable"
                        events={{click: _toggleTrack}}   
                        event-set__mouseenter="scale: 1.2 1.2 1"
                        event-set__mouseleave="scale: 1 1 1"                      
                    ><a-text value={ is_paused ? ">" : "||" } align="center" /></Entity>
                    <Entity 
                        primitive='a-plane' 
                        color="gray" 
                        position="1.1 -0.5 -3" 
                        class="clickable"
                        events={{click: _nextTrack}}  
                        event-set__mouseenter="scale: 1.2 1.2 1"
                        event-set__mouseleave="scale: 1 1 1"                   
                    ><a-text value=">>" align="center" /></Entity>
 
                    <Entity 
                        primitive='a-plane' 
                        src={current_track.album.images[0].url} 
                        position="0 0 -25"
                        height="50"
                        width="50"                    
                    /> 

                    <LyricsUI key={current_track.name + " " + current_track.artists[0].name} name={current_track.name} artist={current_track.artists[0].name} duration={current_track.duration_ms}/>

                </a-scene>
            </>
        );
    }
}

export default SpotifyUI