import React, { useState, useEffect } from 'react';
import './App.css';
import WebPlayback from './WebPlayback'
import VRPlayback from './VRPlayback';
import Login from './Login'
import TestScene from './TestScene';
import SpotifyUI from './SpotifyUI';

function App() {

  const [token, setToken] = useState('');
  const [loginURL, setURL] = useState('')
  console.log("token:"+token)

  useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        setURL(
          "http://localhost:5000/login"
        );
      } else {
        setURL(
          "https://peaceful-shelf-11387.herokuapp.com/login"
        );
      }

        // Getting the parameters from the url
        const params = getHashParams();
        // Getting the hashed token
        const token = params.access_token;
        // Set the hashed token
        setToken(token);
        console.log("token after useeffect:"+token)

        function getHashParams() {
          var hashParams = {};
          var e,
            r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
          e = r.exec(q);
          while (e) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
            e = r.exec(q);
          }
          return hashParams;
        };
  }, []);

  return (
    <>
        {/* { (token === '' || token === undefined) ? <Login url={loginURL}/> : <WebPlayback token={token} /> } */}
        {/* { (token === '' || token === undefined) ? <Login url={loginURL}/>  : <VRPlayback token={token} /> } */}
        { (token === '' || token === undefined) ? <Login url={loginURL}/>  : <SpotifyUI token={token} /> }
        {/* <TestScene></TestScene> */}
    </>
  );
}


export default App;
