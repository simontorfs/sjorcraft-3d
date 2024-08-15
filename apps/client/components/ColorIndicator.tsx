import React from "react";

const ColorIndicator = ({ color, size = 20 }) => {
  const squareStyle = {
    backgroundColor: color,
    width: size,
    height: size,
    border: "2px solid #000",
    borderRadius: 5,
  };

  return <div style={squareStyle}></div>;
};

export default ColorIndicator;
