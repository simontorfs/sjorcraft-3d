import { Box } from "@mui/material";
import React from "react";

export const SjorcraftCanvas = () => {
  return (
    <Box
      className="webgl"
      id="render_area"
      sx={{
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    ></Box>
  );
};

export default SjorcraftCanvas;
