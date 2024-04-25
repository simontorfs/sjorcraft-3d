import { Viewer } from "./apps/3d/src/viewer";

const viewer = new Viewer();

const tick = () => {
  viewer.controls.update();

  viewer.renderer.render(viewer.scene, viewer.camera);

  window.requestAnimationFrame(tick);
};

tick();
