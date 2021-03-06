require("dotenv").config();

const express = require("express");
const uuid = require("uuid").v4;
const querystring = require("querystring");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const lyricsFinder = require('lyrics-finder');

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || null;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || null;
const PORT = process.env.PORT || 5000;
let REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || null;
let FRONTEND_URI = process.env.REACT_APP_FRONTEND_URI || null;

const authStateKey = "spotify_auth_state";

if (process.env.NODE_ENV !== "production") {
  REDIRECT_URI = `http://localhost:${PORT}/callback`;
  FRONTEND_URI = `http://localhost:3000`;
}

global.access_token = '' // TODO create global access_tokens and hide from url


const app = express(); //research: express router -> app.use(router)

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/login", (req, res, next) => {
  const state = uuid();
  const scope =
    "streaming \
    user-read-private \
    user-read-email \
    user-read-playback-state \
    user-modify-playback-state \
    user-library-read \
    user-library-modify \
    user-read-recently-played \
    user-top-read \
    playlist-modify-private \
    ";

  res.cookie(authStateKey, state);

  res.status(302).redirect(
    `https://accounts.spotify.com/authorize?${querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      state: state,
      scope: scope,
    })}`
  );
});

app.get("/callback", (req, res, next) => {
  const code = req.query.code;
  const state = req.query.state;
  const storedState = req.cookies ? req.cookies[authStateKey] : null;

  if (storedState === null || storedState !== state) {
    res.status(302).redirect(
      `/#${querystring.stringify({
        error: "invalid_state",
      })}`
    );
  } else {
    res.clearCookie(authStateKey);
    const data = {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    };

    axios
      .post(
        `https://accounts.spotify.com/api/token`,
        querystring.stringify(data),
        {
          headers: {
            Authorization: `Basic ${new Buffer.from(
              `${CLIENT_ID}:${CLIENT_SECRET}`
            ).toString("base64")}`,
            "Content-type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        let { access_token, refresh_token, expires_in } = response.data;
        
        // we can also pass the token to the browser to make requests from there
          res.redirect(
            // "https://peaceful-shelf-11387.herokuapp.com/" 
            FRONTEND_URI
            
            + "#" +
            // `${front_end_url}/#` +
              querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
              }));

        // res.redirect(
        //   `${FRONTEND_URI}/#${querystring.stringify({
        //     access_token,
        //     refresh_token,
        //     expires_in,
        //   })}`
        // );
      })
      .catch((err) => {
        console.log(err);
        res
          .status(302)
          .redirect(`/#${querystring.stringify({ error: "invalid_token" })}`);
      });
  }
});

app.get("/refresh-token", (req, res, next) => {
  const refresh_token = req.query.refresh_token || null;

  if (!refresh_token) {
    throw new Error("Invalid request. No refresh_token supplied.");
  }

  const data = {
    grant_type: "refresh_token",
    refresh_token,
  };

  axios
    .post(
      `https://accounts.spotify.com/api/token`,
      querystring.stringify(data),
      {
        headers: {
          Authorization: `Basic ${new Buffer.from(
            `${CLIENT_ID}:${CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => {
      const { access_token } = response.data;
      res.status(200).json({ access_token });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(); //check axios documentation for err.response.error
    });
});

app.get('/getLyrics', async (req, res) => {
    const artist = req.query.artist;
    const title = req.query.title;

    console.log(`Lyrics search: ${artist} - ${title}...`);
    try {
      const lyrics = (await lyricsFinder(artist, title)) || null;

      if (!lyrics) {
        throw new Error('No lyrics found');
      }

      console.log('Lyrics found.');
      res.status(200).json({ lyrics });
    } catch (e) {
      console.log(`Error occurred while searching: ${e}`);
      res.status(404).send();
    }
});

// // Priority serve any static files.
// app.use(express.static(path.resolve(__dirname, "../client/build")));
// Priority serve any static files.
app
  .use(express.static(path.resolve(__dirname, "../react-ui/build")))
  .use(cors())
  .use(cookieParser());


// All remaining requests return the React app, so it can handle routing.
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT}`);
});
