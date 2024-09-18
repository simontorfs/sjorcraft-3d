import { BipodLashing } from "./bipodLashing";
import { Lashing } from "./lashing";
import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class DestructionTool {
  active: boolean;
  viewer: Viewer;
  hoveredObject: Pole | Lashing | BipodLashing | undefined;
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
    if (this.hoveredObject instanceof Lashing) {
      this.viewer.inventory.removeLashing(this.hoveredObject);
    } else if (this.hoveredObject instanceof Pole) {
      this.viewer.inventory.removePole(this.hoveredObject);
    } else if (this.hoveredObject instanceof BipodLashing) {
      this.viewer.inventory.removeBipodLashing(this.hoveredObject);
    }
  }

  setHoveredObject(object: Pole | Lashing | BipodLashing) {
    if (object === this.hoveredObject) return;
    this.hoveredObject?.stopThreatening();
    this.hoveredObject = object;
    this.hoveredObject?.threatenWithDestruction();
    if (this.hoveredObject) {
      this.viewer.domElement.style.cursor = "url(./cursors/axe.cur) 5 5, auto";
    } else {
      this.viewer.domElement.style.cursor = "default";
    }
  }
}
