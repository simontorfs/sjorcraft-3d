import { Box } from "@mui/material";
import zIndex from "@mui/material/styles/zIndex";
import React from "react";

const EditorSidebar = () => {
  return (
    <Box
      component={"aside"}
      sx={{
        height: "99vh",
        padding: "1rem 0 0 1rem",
        backgroundColor: "secondary.light",
        color: "primary.text",
      }}
    >
      <Box>
        <h1>Test</h1>
      </Box>
      <Box component={"div"}>
        <h2>Environnement variables</h2>
      </Box>
    </Box>
  );
};

export default EditorSidebar;
