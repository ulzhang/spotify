import React, { useState, useEffect } from 'react';
import { Entity, Scene } from 'aframe-react';
import 'aframe';

let deviceId = '';
const COLORS = ['#D92B6A', '#9564F2', '#FFCF59']

function VRPlayback(props) {

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
                console.log("on")
                  fetch('https://api.spotify.com/v1/me/player', {
                    method: "PUT",
                    body: JSON.stringify({
                      device_ids:[
                        data.device_id
                      ],
                      play: false
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

    function _handleClick() {
        console.log("clicked")
    }

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
                <Scene>
                    <Entity primitive='a-box' src={current_track.album.images[0].url} position="0 3 -5" 
                        class="clickable"
                        events={{click: _handleClick}}                      
                    /> 
                    <Entity primitive='a-box' color="red" position="-3 0 -5" class="clickable"
                        events={{click: _prevTrack}}                      
                    /> 
                    <Entity primitive='a-box' color="green" position="0 0 -5" class="clickable"
                        events={{click: _toggleTrack}}                      
                    /> 
                    <Entity primitive='a-box' color="blue" position="3 0 -5" class="clickable"
                        events={{click: _nextTrack}}                      
                    /> 
                    <a-camera>
                            <a-cursor></a-cursor>
                    </a-camera>
                </Scene>


            </>
        );
    }
}

export default VRPlayback