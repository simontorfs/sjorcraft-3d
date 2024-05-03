// add sjorcraftcanvas with a right panel that is collapsable
import React from "react";
import { SjorcraftCanvas } from "./SjorcraftCanvas";

const SjorcraftEditor = () => {
  return (
    <div className="sjorcraft-editor">
      <h1>Sjorcraft</h1>
      <SjorcraftCanvas />
    </div>
  );
};

export default SjorcraftEditor;
