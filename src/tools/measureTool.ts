import { DistanceHelperLine } from "../objects/helperLine";
import { Viewer } from "../viewer";
import { Tool } from "./tool";

export class MeasureTool extends Tool {
  distanceLabels: DistanceHelperLine = new DistanceHelperLine();
  constructor(viewer: Viewer) {
    super(viewer);
  }
  activate() {
    this.active = true;
    this.viewer.scene.add(this.distanceLabels);
  }
  deactivate() {
    this.active = false;
    this.viewer.scene.remove(this.distanceLabels);
  }
  onMouseMove() {
    const hoveredPole = this.viewer.inputHandler.getHoveredPole();
    if (!hoveredPole) {
      this.distanceLabels.visible = false;
      return;
    }

    const bottom = hoveredPole.getBottom();
    const measurePoints = [
      hoveredPole.getTop(),
      hoveredPole.getBottom(),
      ...this.viewer.inventory.getLashPointsOnPole(hoveredPole),
    ].sort((a, b) => bottom.distanceTo(a) - bottom.distanceTo(b));

    this.distanceLabels.visible = true;
    this.distanceLabels.setBetweenPoints(measurePoints);
  }
}
