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
    this.selectedPole?.deselect();
    this.selectedPole = undefined;
    document.body.style.cursor = "default";
  }

  leftClick() {
    if (!this.active) return;
    this.selectedPole?.deselect();
    this.hoveredPole?.select();
    this.selectedPole = this.hoveredPole;
  }

  delete() {
    if (!this.active || !this.selectedPole) return;
    this.viewer.scene.remove(this.selectedPole);
    this.viewer.poles = this.viewer.poles.filter(
      (pole) => pole !== this.selectedPole
    );
  }

  setHoveredPole(pole: Pole) {
    this.hoveredPole = pole;
    if (this.hoveredPole) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  }
}
