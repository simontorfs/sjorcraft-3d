import { Pole } from "../objects/pole";
import { Viewer } from "../viewer";

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
    this.viewer.domElement.style.cursor = "default";
  }

  onMouseMove() {
    const poleIntersect = this.viewer.inputHandler.getPoleIntersect();
    const hoveredPole = poleIntersect?.object.parent as Pole;
    this.setHoveredPole(hoveredPole);
  }

  deselectAll() {
    for (const pole of this.selectedPoles) {
      pole.deselect();
    }
    this.selectedPoles = [];
  }

  selectAll() {
    this.selectedPoles = this.viewer.inventory.poles;
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
    this.viewer.inventory.removePoles(this.selectedPoles);
  }

  setHoveredPole(pole: Pole) {
    this.hoveredPole = pole;
    if (this.hoveredPole) {
      this.viewer.domElement.style.cursor = "pointer";
    } else {
      this.viewer.domElement.style.cursor = "default";
    }
  }
}
