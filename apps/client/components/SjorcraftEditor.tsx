// add sjorcraftcanvas with a right panel that is collapsable
import React from "react";
import { SjorcraftCanvas } from "./SjorcraftCanvas";

const SjorcraftEditor = () => {
  return (
    <div>
      <SjorcraftCanvas />
      <div>
        <button>Toggle Right Panel</button>
        <div>
          <h1>Right Panel</h1>
        </div>
      </div>
    </div>
  );
};

export default SjorcraftEditor;
