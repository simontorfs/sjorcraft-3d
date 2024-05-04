import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../../style.css";
import { BrowserRouter } from "react-router-dom";
import { Viewer } from "../3d/src/viewer";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <React.Suspense fallback="loading">
        <App />
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>
);

const tick = () => {
  setTimeout(() => {
    const viewer = new Viewer();
    viewer.controls.update();

    viewer.renderer.render(viewer.scene, viewer.camera);

    window.requestAnimationFrame(tick);
  }, 10);
};

tick();
