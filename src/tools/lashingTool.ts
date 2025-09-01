import { ScaffoldLashing } from "../objects/lashings/scaffoldLashing";
import { SquareLashing } from "../objects/lashings/squareLashing";
import { Pole } from "../objects/pole";
import { Viewer } from "../viewer";
import { Tool } from "./tool";

export class LashingTool extends Tool {
  hoveredPole: Pole | undefined;
  activeLashing: SquareLashing = new SquareLashing();
  activeScaffoldLashing: ScaffoldLashing = new ScaffoldLashing(
    new Pole(),
    new Pole(),
    0
  );
  constructor(viewer: Viewer) {
    super(viewer);
    this.activeLashing.visible = false;
    this.activeScaffoldLashing.visible = false;
    this.viewer.scene.add(this.activeLashing);
    this.viewer.scene.add(this.activeScaffoldLashing);
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
    this.activeLashing.visible = false;
    this.activeScaffoldLashing.visible = false;
  }

  onLeftClick() {
    if (!this.active) return;
    if (this.activeLashing.visible) {
      this.viewer.inventory.addLashings([this.activeLashing]);
      this.activeLashing = new SquareLashing();
      this.activeLashing.visible = false;
      this.viewer.scene.add(this.activeLashing);
    } else if (this.activeScaffoldLashing.visible) {
      this.viewer.inventory.addScaffoldLashings([this.activeScaffoldLashing]);
      this.activeScaffoldLashing = new ScaffoldLashing(
        new Pole(),
        new Pole(),
        0
      );
      this.activeScaffoldLashing.visible = false;
      this.viewer.scene.add(this.activeScaffoldLashing);
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
      this.activeScaffoldLashing.visible = false;
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
      (p) => p !== hoveredPole && !polesLashedToHovered.includes(p)
    )) {
      if (hoveredPole.isParallelTo(pole.direction)) {
        const radialDistance =
          hoveredPole.getRadialDistanceToParallelPole(pole);
        if (pole.hasProjection(cursorPoint) && radialDistance < 0.2) {
          closestPoleDist = radialDistance;
          closestPole = pole;
        }
      } else {
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
    }
    if (closestPole) {
      if (closestPole.isParallelTo(hoveredPole.direction)) {
        this.activeLashing.visible = false;
        this.activeScaffoldLashing.visible = true;
        this.activeScaffoldLashing.setPoles(hoveredPole, closestPole);
        const offset = cursorPoint
          .clone()
          .sub(hoveredPole.position)
          .dot(hoveredPole.direction);
        this.activeScaffoldLashing.setOffset(offset);
      } else {
        this.activeScaffoldLashing.visible = false;
        this.activeLashing.visible = true;
        this.activeLashing.setPropertiesFromTwoPoles(hoveredPole, closestPole);
      }
    } else {
      this.activeLashing.visible = false;
      this.activeScaffoldLashing.visible = false;
    }
  }
}
