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
    document.body.style.cursor = "url(./cursors/axe.cur) 5 5, auto";
  }

  deactivate() {
    this.active = false;
    document.body.style.cursor = "default";
  }

  leftClick() {
    if (!this.active) return;
    if (this.hoveredPole) {
      this.viewer.poleInventory.removePole(this.hoveredPole);
    }
  }

  setHoveredPole(pole: Pole) {
    if (pole === this.hoveredPole) return;
    this.hoveredPole?.stopThreatening();
    this.hoveredPole = pole;
    this.hoveredPole?.threatenWithDestruction();
  }
}
