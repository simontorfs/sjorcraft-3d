import React, { useEffect } from "react";
import { SjorcraftCanvas } from "./SjorcraftCanvas";
import Navbar from "./Navbar";
import EditorSidebar from "./EditorSidebar";
import { Grid } from "@mui/material";
import Toolbar from "./Toolbar";
import { Viewer } from "../../3d/src/viewer";
import {
  RendererContext,
  RendererContextType,
} from "../contexts/rendererContext";

const SjorcraftEditor = () => {
  const [rendererContext, setRendererContext] =
    React.useState<RendererContextType>({});

  let initialised = false;
  useEffect(() => {
    if (initialised) return;
    const element = document.getElementById("render_area");
    if (!element) return;

    const viewer = new Viewer(element);
    setRendererContext({ viewer });

    initialised = true;
  }, []);

  return (
    <div className="sjorcraft-editor">
      <RendererContext.Provider value={rendererContext}>
        <Toolbar />
        <SjorcraftCanvas />
      </RendererContext.Provider>
    </div>
  );
};

export default SjorcraftEditor;
