import React from "react";
import "./Card.css";

const Card = ({ src, title, date, description, extra_content, content }) => {
  const renderedArtists = description.map((artist) => {
    return <p key={artist.name}>{artist.name}</p>;
  });
  return (
    <div className="ui card SongCard">
      <div className="image">
        <img src={src} alt={title} />
      </div>

      <div className="content">
        <h3 className="header">{title}</h3>
        <div className="meta">
          <span className="date">{date}</span>
        </div>
        <div className="description">{renderedArtists}</div>
      </div>
      {extra_content ? (
        <div className="extra content">{extra_content}</div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Card;
