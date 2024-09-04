import { Pole } from "./pole";
import { Viewer } from "./viewer";
import * as THREE from "three";

export class LashingTool {
  active: boolean;
  viewer: Viewer;
  hoveredPole: Pole | undefined;
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
    console.log(this.hoveredPole);
  }

  setHoveredPole(hoveredPole: Pole) {
    this.hoveredPole = hoveredPole;
    if (!hoveredPole) return;
    //@ts-ignore
    hoveredPole.mesh.material.color = new THREE.Color(0xffffff);

    const point1 = this.viewer.inputHandler.getPointOnLineClosestToCursor(
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
      (p) => p !== hoveredPole && !polesLashedToHovered.includes(p)
    )) {
      const poleDiff = hoveredPole.position.clone().sub(pole.position);
      const polesDistance =
        Math.abs(
          hoveredPole.direction
            .clone()
            .cross(pole.direction)
            .normalize()
            .dot(poleDiff)
        ) -
        hoveredPole.radius -
        pole.radius;

      const point2 = this.viewer.inputHandler.getPointOnLineClosestToCursor(
        pole.position,
        pole.direction
      );
      const pointsDistance = point1.distanceTo(point2);

      if (polesDistance < 0.2 && pointsDistance < polesDistance + 0.17) {
        if (polesDistance < closestPoleDist) {
          closestPoleDist = polesDistance;
          closestPole = pole;
        }
      } else {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(0xffffff);
      }
    }
    if (closestPole) {
      // @ts-ignore
      closestPole.mesh.material.color = new THREE.Color(0x00ff00);
    }
  }
}
