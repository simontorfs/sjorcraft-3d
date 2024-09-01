import { Box } from "@mui/material";
import React from "react";

export const SjorcraftCanvas = () => {
  return (
    <Box
      id="render_area"
      sx={{
        height: "100%",
        width: "100%",
        zIndex: 0,
        outline: "none",
        position: "relative",
      }}
    ></Box>
  );
};

export default SjorcraftCanvas;
