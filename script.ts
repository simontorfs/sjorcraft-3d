import { Viewer } from "./apps/3d/src/viewer";

let firstViewer: Viewer;
setTimeout(() => {
  firstViewer = new Viewer();
}, 10);

const viewer = new Viewer();

export const tick = () => {
  viewer.controls.update();

  viewer.renderer.render(viewer.scene, viewer.camera);

  window.requestAnimationFrame(tick);
};

tick();
