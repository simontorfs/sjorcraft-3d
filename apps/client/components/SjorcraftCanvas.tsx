import React, { useEffect } from "react";
import { Viewer } from "../../3d/src/viewer";

export const SjorcraftCanvas = () => {
  let initialised = false;
  useEffect(() => {
    if (initialised) return;
    const element = document.getElementById("render_area");
    if (!element) return;
    const viewer = new Viewer(element);
    initialised = true;
  }, []);

  return <div className="webgl" id="render_area"></div>;
};

export default SjorcraftCanvas;
