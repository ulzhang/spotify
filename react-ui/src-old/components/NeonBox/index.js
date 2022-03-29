import React from "react";
import "./NeonBox.css";

const NeonBox = ({ isPlaying, text }) => {
  return (
    <div
      id="container"
      className={"NeonBox " + (isPlaying ? "isPlaying" : "notPlaying")}
    >
      <p>
        <a>{text}</a>
      </p>
    </div>
  );
};

export default NeonBox;
