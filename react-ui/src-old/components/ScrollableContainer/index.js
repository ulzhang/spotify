import React from "react";
import "./ScrollableContainer.css";
import Card from "../Card/";

// The scrollable container is populated by multiple card components
const ScrollableContainer = ({ recentlyPlayed }) => {
  const renderedSongs = recentlyPlayed.map((song) => {
    return (
      <li className="item">
        <Card
          src={song.track.album.images[0].url}
          title={song.track.name}
          description={song.track.artists}
          key={song.track.id}
        />
      </li>
    );
  });
  return (
    <div className="app">
      <ul className="hs">{renderedSongs}</ul>
    </div>
  );
};

export default ScrollableContainer;
