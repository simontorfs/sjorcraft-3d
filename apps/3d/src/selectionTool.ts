import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class SelectionTool {
  active: boolean;
  viewer: Viewer;
  hoveredPole: Pole | undefined;
  selectedPole: Pole | undefined;
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
    this.hoveredPole?.select();
    this.selectedPole = this.hoveredPole;
  }
}
