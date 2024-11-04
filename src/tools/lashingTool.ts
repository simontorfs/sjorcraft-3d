import { Lashing } from "../objects/lashings/lashing";
import { Pole } from "../objects/pole";
import { Viewer } from "../viewer";
import * as THREE from "three";

export class LashingTool {
  active: boolean;
  viewer: Viewer;
  hoveredPole: Pole | undefined;
  activeLashing: Lashing = new Lashing();
  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = false;
    this.activeLashing.visible = false;
    this.viewer.scene.add(this.activeLashing);
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
    this.activeLashing.visible = false;
  }

  leftClick() {
    if (!this.active) return;
    if (this.activeLashing.visible) {
      this.viewer.inventory.addLashing(this.activeLashing);
      this.activeLashing = new Lashing();
      this.activeLashing.visible = false;
      this.viewer.scene.add(this.activeLashing);
    }
  }

  onMouseMove() {
    const hoveredPole = this.viewer.inputHandler.getHoveredPole();
    this.setHoveredPole(hoveredPole);
  }

  setHoveredPole(hoveredPole: Pole) {
    this.hoveredPole = hoveredPole;
    if (!hoveredPole) {
      this.activeLashing.visible = false;
      return;
    }

    const cursorPoint = this.viewer.inputHandler.getPointOnLineClosestToCursor(
      hoveredPole.position,
      hoveredPole.direction
    );

    let closestPole: Pole | undefined = undefined;
    let closestPoleDist = Infinity;

    const polesLashedToHovered = this.viewer.inventory.lashings.flatMap(
      (lashing) => {
        if (lashing.fixedPole === hoveredPole) return [lashing.loosePole];
        if (lashing.loosePole === hoveredPole) return [lashing.fixedPole];
        return [];
      }
    );

    for (const pole of this.viewer.inventory.poles.filter(
      (p) =>
        p !== hoveredPole &&
        !polesLashedToHovered.includes(p) &&
        !p.isParallelTo(hoveredPole.direction)
    )) {
      const { closestPoint, closestPointOnOtherPole } =
        hoveredPole.getClosestApproach(pole);
      const poleDistance = closestPoint.distanceTo(closestPointOnOtherPole);
      const pointsDistance = closestPoint.distanceTo(cursorPoint);

      if (poleDistance < 0.25 && pointsDistance < 0.1) {
        if (pointsDistance < closestPoleDist) {
          closestPoleDist = pointsDistance;
          closestPole = pole;
        }
      }
    }
    if (closestPole) {
      this.activeLashing.visible = true;
      this.activeLashing.setPropertiesFromTwoPoles(hoveredPole, closestPole);
    } else {
      this.activeLashing.visible = false;
    }
  }
}
