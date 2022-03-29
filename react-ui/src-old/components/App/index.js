import React, { Component } from "react";
import "./App.css";
import SpotifyWebApi from "spotify-web-api-js";
import ScrollableContainer from "../ScrollableContainer";
import NowPlaying from "../NowPlaying";

const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
    // Getting the parameters from the url
    const params = this.getHashParams();
    // Getting the hashed token
    const token = params.access_token;
    console.log("TOKEN: " + token)

    if (token) {
      spotifyApi.setAccessToken(token);
      console.log("set access token")
    }

    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: {
        songName: "",
        albumArt: "",
        artistNames: [],
        trackDetails: null,
        stillLoading: true,
        warning: { status: false, message: "" },
        isPlaying: false,
      },
      recentlyPlayed: [],
      url: "",
      topTracks: {},
    };
  }
  getHashParams = () => {
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
  // Gets the recently played tracks of the user
  getRecentlyPlayed = async () => {
    try {
      const response = await spotifyApi.getMyRecentlyPlayedTracks({
        limit: 10,
      });
      // console.log(response.items);

      this.setState({ recentlyPlayed: response.items });
    } catch (e) {
      console.log(e.response);
    }
  };

  setNowPlaying = (response, trackDetails = null) => {
    const { nowPlaying } = this.state;
    const song = response.item;
    let copyNowPlaying = { ...nowPlaying };

    if (response.is_playing !== nowPlaying.isPlaying) {
      copyNowPlaying.isPlaying = response.is_playing;
    }

    if (nowPlaying.warning.status) {
      copyNowPlaying.warning.status = false;
    }

    this.setState({
      nowPlaying: {
        ...copyNowPlaying,
        songName: song.name,
        albumArt: song.album.images[0].url,
        artistNames: song.artists,
        stillLoading: false,
        trackDetails: trackDetails,
      },
    });
  };

  // Gets the currently playing track
  getNowPlaying = async () => {
    try {
      const { loggedIn, nowPlaying } = this.state;
      // Check the current track that is playing
      const response = await spotifyApi.getMyCurrentPlaybackState();

      if (response) {
        const song = response.item;
        if (loggedIn && song.name !== nowPlaying.songName) {
          const trackDetails = await spotifyApi.getAudioFeaturesForTrack(
            response.item.id
          );

          this.setNowPlaying(response, trackDetails);
          // Update state pls!
          setTimeout(() => {
            this.getRecentlyPlayed();
          }, 4000);
        } else {
          this.setNowPlaying(response, nowPlaying.trackDetails);
        }
      } else {
        // The response was undefined.
        // Meaning: The user is not currently playing a track

        this.setState({
          nowPlaying: {
            ...this.state.nowPlaying,
            stillLoading: false,
            warning: {
              status: true,
              message: "please play spotify to see your current track",
            },
          },
        });
        this.getRecentlyPlayed();
      }
    } catch (e) {
      console.log(e);
    }
  };

  getTopTracks = async () => {
    try {
      const response = await spotifyApi.getMyTopTracks({ limit: 50 });
      const songs = response.items;

      let ids = [];

      songs.forEach((song) => {
        ids.push(song.id);
      });

      const TracksDetails = await spotifyApi.getAudioFeaturesForTracks(ids);
      this.setState({
        topTracks: TracksDetails,
      });
    } catch (e) {
      console.log(e);
    }
  };

  componentDidMount = async () => {
    // Check the build of react and sets correct urls
    if (process.env.NODE_ENV !== "production") {
      this.setState({
        url: "http://localhost:5000/login",
      });
    } else {
      this.setState({
        // url: "https://pacific-sands-61806.herokuapp.com/login",
        url: "https://peaceful-shelf-11387.herokuapp.com/login",
      });
    }

    this.getTopTracks();

    // We are going to check the playback state every interval of one second
    this.intervalId = await setInterval(() => {
      if (this.state.loggedIn) {
        this.getNowPlaying();
      }
    }, 1000);
  };

  // Make sure to clear the interval if we unmount
  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return (
      <div className="App">
        <NowPlaying
          loggedIn={this.state.loggedIn}
          nowPlaying={this.state.nowPlaying}
          url={this.state.url}
          topTracks={this.state.topTracks}
        />
        <div>
          {this.state.recentlyPlayed.length !== 0 && (
            <div>
              <h4 className="ui horizontal divider" style={{ color: "white" }}>
                what you've been listening to
              </h4>
              <ScrollableContainer recentlyPlayed={this.state.recentlyPlayed} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
