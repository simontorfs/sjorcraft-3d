import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class LashingTool {
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
  }

  leftClick() {
    if (!this.active) return;
    console.log(this.hoveredPole);
  }

  setHoveredPole(pole: Pole) {
    this.hoveredPole = pole;
  }
}
