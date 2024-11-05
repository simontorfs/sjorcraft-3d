import { Viewer } from "../viewer";

export class Tool {
  viewer: Viewer;
  active: boolean;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = false;
  }

  activate() {
    this.active = true;
  }
  deactivate() {
    this.active = false;
  }
  onMouseMove() {}
  onMouseDrag() {}
  onMouseDrop() {}
  onLeftClick() {}
  onRightClick() {}

  onCtrlLeftClick() {
    this.onLeftClick();
  }

  onArrowUp() {}
  onArrowDown() {}
}
