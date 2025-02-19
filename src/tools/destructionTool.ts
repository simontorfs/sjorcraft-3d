import { BipodLashing } from "../objects/lashings/bipodLashing";
import { Lashing } from "../objects/lashings/lashing";
import { Pole } from "../objects/pole";
import { Viewer } from "../viewer";
import { Tool } from "./tool";

export class DestructionTool extends Tool {
  active: boolean;
  viewer: Viewer;
  hoveredObject: Pole | Lashing | BipodLashing | undefined;
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
    if (this.hoveredObject instanceof Lashing) {
      this.viewer.inventory.removeLashing(this.hoveredObject, true);
    } else if (this.hoveredObject instanceof Pole) {
      this.viewer.inventory.removePole(this.hoveredObject, true);
    } else if (this.hoveredObject instanceof BipodLashing) {
      this.viewer.inventory.removeBipodLashing(this.hoveredObject, true);
    }
  }

  onMouseMove() {
    const hoveredObject = this.viewer.inputHandler.getHoveredObject();
    this.setHoveredObject(hoveredObject);
  }

  setHoveredObject(object: Pole | Lashing | BipodLashing) {
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
