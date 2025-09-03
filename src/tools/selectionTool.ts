import { Pole } from "../objects/pole";
import { Viewer } from "../viewer";
import { Tool } from "./tool";

export class SelectionTool extends Tool {
  hoveredPole: Pole | undefined;
  selectedPoles: Pole[] = [];
  constructor(viewer: Viewer) {
    super(viewer);
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
    const hoveredPole = this.viewer.inputHandler.getHoveredPole();
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

  onLeftClick() {
    if (!this.active) return;
    this.deselectAll();
    if (this.hoveredPole) {
      this.hoveredPole.select();
      this.selectedPoles.push(this.hoveredPole);
    }
  }

  onCtrlLeftClick() {
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
  }

  deleteSelectedPoles() {
    if (!this.active || !this.selectedPoles.length) return;
    this.viewer.inventory.removePoles(this.selectedPoles);
  }

  setHoveredPole(pole: Pole | undefined) {
    this.hoveredPole = pole;
    if (this.hoveredPole) {
      this.viewer.domElement.style.cursor = "pointer";
    } else {
      this.viewer.domElement.style.cursor = "default";
    }
  }
}
