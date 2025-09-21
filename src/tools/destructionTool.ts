import { BipodLashing } from "../objects/lashings/bipodLashing";
import { SquareLashing } from "../objects/lashings/squareLashing";
import { ScaffoldLashing } from "../objects/lashings/scaffoldLashing";
import { Pole } from "../objects/pole";
import { Viewer } from "../viewer";
import { Tool } from "./tool";
import { Lashing } from "../objects/lashings/lashing";
import { TripodLashing } from "../objects/lashings/tripodLashing";

export class DestructionTool extends Tool {
  hoveredObject: Pole | Lashing | undefined;
  constructor(viewer: Viewer) {
    super(viewer);
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
    this.viewer.domElement.style.cursor = "default";
  }

  onLeftClick() {
    if (!this.active) return;
    if (this.hoveredObject instanceof SquareLashing) {
      this.viewer.inventory.removeItems({
        squareLashings: [this.hoveredObject],
      });
    } else if (this.hoveredObject instanceof Pole) {
      this.viewer.inventory.removePoles([this.hoveredObject]);
    } else if (this.hoveredObject instanceof BipodLashing) {
      this.viewer.inventory.removeItems({
        bipodLashings: [this.hoveredObject],
      });
    } else if (this.hoveredObject instanceof TripodLashing) {
      this.viewer.inventory.removeItems({
        tripodLashings: [this.hoveredObject],
      });
    } else if (this.hoveredObject instanceof ScaffoldLashing) {
      this.viewer.inventory.removeItems({
        scaffoldLashings: [this.hoveredObject],
      });
    }
  }

  onMouseMove() {
    const hoveredObject = this.viewer.inputHandler.getHoveredObject();
    this.setHoveredObject(hoveredObject);
  }

  setHoveredObject(object: Pole | Lashing | undefined) {
    if (object === this.hoveredObject) return;
    this.hoveredObject?.stopThreatening();
    this.hoveredObject = object;
    this.hoveredObject?.threatenWithDestruction();
    if (this.hoveredObject) {
      this.viewer.domElement.style.cursor = "url(/cursors/axe.cur) 5 5, auto";
    } else {
      this.viewer.domElement.style.cursor = "default";
    }
  }
}
