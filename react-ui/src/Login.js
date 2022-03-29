import React from 'react';

function Login(props) {
    return (
        <div className="App">
            <header className="App-header">
                <a className="btn-spotify" href={props.url} >
                    Login with Spotify 
                </a>
            </header>
        </div>
    );
}

export default Login;

