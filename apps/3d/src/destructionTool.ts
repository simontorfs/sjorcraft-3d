import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class DestructionTool {
  active: boolean;
  viewer: Viewer;
  hoveredPole: Pole | undefined;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = false;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
    this.viewer.domElement.style.cursor = "default";
  }

  leftClick() {
    if (!this.active) return;
    if (this.hoveredPole) {
      this.viewer.inventory.removePole(this.hoveredPole);
    }
  }

  setHoveredPole(pole: Pole) {
    if (pole === this.hoveredPole) return;
    this.hoveredPole?.stopThreatening();
    this.hoveredPole = pole;
    this.hoveredPole?.threatenWithDestruction();
    if (this.hoveredPole) {
      this.viewer.domElement.style.cursor = "url(./cursors/axe.cur) 5 5, auto";
    } else {
      this.viewer.domElement.style.cursor = "default";
    }
  }
}
