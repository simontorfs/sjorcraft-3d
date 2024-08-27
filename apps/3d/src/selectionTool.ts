import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class SelectionTool {
  active: boolean;
  viewer: Viewer;
  hoveredPole: Pole | undefined;
  selectedPoles: Pole[] = [];
  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = false;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
    this.deselectAll();
    this.viewer.poleTransformer.setActivePole(undefined);
    document.body.style.cursor = "default";
  }

  deselectAll() {
    for (const pole of this.selectedPoles) {
      pole.deselect();
    }
    this.selectedPoles = [];
  }

  selectAll() {
    this.selectedPoles = this.viewer.poleInventory.poles;
    for (const pole of this.selectedPoles) {
      pole.select();
    }
  }

  leftClick(ctrlDown: boolean) {
    if (!this.active) return;
    if (ctrlDown) {
      if (!this.hoveredPole) return;
      if (this.hoveredPole.selected) {
        this.hoveredPole.deselect();
        this.selectedPoles = this.selectedPoles.filter(
          (pole) => pole !== this.hoveredPole
        );
      } else {
        this.hoveredPole.select();
        this.selectedPoles.push(this.hoveredPole);
      }
    } else {
      this.deselectAll();
      if (this.hoveredPole) {
        this.hoveredPole.select();
        this.selectedPoles.push(this.hoveredPole);
      }
    }
  }

  deleteSelectedPoles() {
    if (!this.active || !this.selectedPoles.length) return;
    this.viewer.poleInventory.removePoles(this.selectedPoles);
    this.viewer.poleTransformer.setActivePole(undefined);
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
