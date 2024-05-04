// add sjorcraftcanvas with a right panel that is collapsable
import React from "react";
import { SjorcraftCanvas } from "./SjorcraftCanvas";
import Navbar from "./Navbar";

const SjorcraftEditor = () => {
  return (
    <div className="sjorcraft-editor">
      <Navbar />
      <SjorcraftCanvas />
    </div>
  );
};

export default SjorcraftEditor;
