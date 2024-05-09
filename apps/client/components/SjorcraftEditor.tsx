// add sjorcraftcanvas with a right panel that is collapsable
import React from "react";
import { SjorcraftCanvas } from "./SjorcraftCanvas";
import Navbar from "./Navbar";
import EditorSidebar from "./EditorSidebar";
import { Grid } from "@mui/material";

const SjorcraftEditor = () => {
  return (
    <div className="sjorcraft-editor">
      <Navbar />
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <SjorcraftCanvas />
        </Grid>
        <Grid item xs={3}>
          <EditorSidebar />
        </Grid>
      </Grid>
    </div>
  );
};

export default SjorcraftEditor;
