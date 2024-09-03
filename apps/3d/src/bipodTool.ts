import { Scaffold } from "./scaffold";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { HelperLine } from "./helperLine";

export class BipodTool {
  active: boolean = false;
  viewer: Viewer;

  scaffold1: Scaffold = new Scaffold();
  scaffold2: Scaffold = new Scaffold();

  scaffold1Placed: boolean = false;
  scaffold2Placed: boolean = false;
  lashPositionPlaced: boolean = false;

  firstGroundPoint: THREE.Vector3 = new THREE.Vector3();
  secondGroundPoint: THREE.Vector3 = new THREE.Vector3();
  lashPosition: THREE.Vector3 = new THREE.Vector3();
  lashPositionProjectedOnFloor: THREE.Vector3 = new THREE.Vector3();
  defaultLashHeight: number = 3.0;
  lashHeight: number = this.defaultLashHeight;

  parallelHelperLine: HelperLine = new HelperLine();
  perpendicularHelperLine: HelperLine = new HelperLine();
  verticalHelperLine: HelperLine = new HelperLine();

  bipodIsColliding: boolean = false;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  activate() {
    this.active = true;
    this.scaffold1.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold2.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold1.addToScene(this.viewer.scene);
    this.scaffold2.addToScene(this.viewer.scene);
  }

  deactivate() {
    this.active = false;
    this.scaffold1.removeFromScene(this.viewer.scene);
    this.scaffold2.removeFromScene(this.viewer.scene);
    this.removeHorizontalHelperLines();
    this.removeVerticalHelperLine();
    this.resetParameters();
    this.viewer.inventory.resetAllColors();
  }

  resetParameters() {
    this.scaffold1Placed = false;
    this.scaffold2Placed = false;
    this.lashPositionPlaced = false;
    this.lashHeight = this.defaultLashHeight;
  }

  leftClick() {
    if (!this.active) return;

    if (!this.scaffold1Placed) {
      this.scaffold1Placed = true;
    } else if (!this.scaffold2Placed) {
      this.scaffold2Placed = true;
      this.AddHorizontalHelperLines();
    } else if (!this.lashPositionPlaced) {
      this.lashPositionPlaced = true;
      this.removeHorizontalHelperLines();
      this.addVerticalHelperLine();
    } else {
      if (this.bipodIsColliding) return;
      this.removeVerticalHelperLine();
      this.scaffold1.addToViewer(this.viewer);
      this.scaffold2.addToViewer(this.viewer);
      this.scaffold1 = new Scaffold();
      this.scaffold2 = new Scaffold();
      this.scaffold1.addToScene(this.viewer.scene);
      this.scaffold2.addToScene(this.viewer.scene);
      this.resetParameters();
    }
  }

  rightClick() {
    if (!this.active) return;

    if (this.lashPositionPlaced) {
      this.lashPositionPlaced = false;
      this.removeVerticalHelperLine();
      this.AddHorizontalHelperLines();
    } else if (this.scaffold2Placed) {
      this.scaffold2Placed = false;
      this.removeHorizontalHelperLines();
    } else if (this.scaffold1Placed) {
      this.scaffold1Placed = false;
    } else {
      this.resetParameters();
    }
  }

  drawBipod(groundPosition: THREE.Vector3) {
    if (!this.scaffold1Placed) {
      this.drawFirstStep(groundPosition);
    } else if (!this.scaffold2Placed) {
      this.drawSecondStep(groundPosition);
    } else if (!this.lashPositionPlaced) {
      this.drawThirdStep(groundPosition);
    } else {
      this.drawFourthStep();
    }
    this.checkCollisions();
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.scaffold1.setPositionOnGround(groundPosition);
    this.scaffold2.setPositionOnGround(
      groundPosition
        .clone()
        .add(
          new THREE.Vector3(
            this.scaffold1.mainRadius + this.scaffold2.mainRadius,
            0,
            0
          )
        )
    );
    this.firstGroundPoint = groundPosition;
  }

  drawSecondStep(groundPosition: THREE.Vector3) {
    this.secondGroundPoint = groundPosition;
    this.lashPositionProjectedOnFloor = this.getCenter();
    this.calculatePositions();
  }

  drawThirdStep(groundPosition: THREE.Vector3) {
    this.lashPositionProjectedOnFloor = groundPosition;
    this.calculatePositions();
  }

  drawFourthStep() {
    let target = this.viewer.inputHandler.getPointOnLineClosestToCursor(
      this.lashPositionProjectedOnFloor,
      new THREE.Vector3(0, 1, 0)
    );

    this.lashHeight = target.y;

    this.calculatePositions();
    this.updateVerticalHelperLine();
  }

  calculatePositions() {
    const lashingOffset = new THREE.Vector3()
      .crossVectors(this.scaffold1.direction, this.scaffold2.direction)
      .normalize()
      .multiplyScalar(
        (this.scaffold1.mainRadius + this.scaffold2.mainRadius) / 2.0
      );

    this.lashPosition = new THREE.Vector3(
      this.lashPositionProjectedOnFloor.x,
      this.lashHeight,
      this.lashPositionProjectedOnFloor.z
    );

    const centerScaffold1 = this.lashPosition.clone().add(lashingOffset);
    const centerScaffold2 = this.lashPosition.clone().sub(lashingOffset);

    this.scaffold1.setPositionBetweenGroundAndPole(
      this.firstGroundPoint,
      centerScaffold1
    );
    this.scaffold2.setPositionBetweenGroundAndPole(
      this.secondGroundPoint,
      centerScaffold2
    );
  }

  getCenter() {
    return this.firstGroundPoint
      .clone()
      .add(this.secondGroundPoint)
      .divideScalar(2.0);
  }

  AddHorizontalHelperLines() {
    const pointsParallel = [this.firstGroundPoint, this.secondGroundPoint];
    this.parallelHelperLine.setBetweenPoints(pointsParallel);
    this.viewer.scene.add(this.parallelHelperLine);

    const center = this.getCenter();
    const perpendicularDirection = new THREE.Vector3()
      .crossVectors(
        this.firstGroundPoint.clone().sub(this.secondGroundPoint),
        new THREE.Vector3(0, 1, 0)
      )
      .normalize();

    const pointsPerpendicular = [
      center.clone().add(perpendicularDirection.clone().multiplyScalar(5)),
      center.clone().sub(perpendicularDirection.clone().multiplyScalar(5)),
    ];
    this.perpendicularHelperLine.setBetweenPoints(pointsPerpendicular);
    this.viewer.scene.add(this.perpendicularHelperLine);
  }

  removeHorizontalHelperLines() {
    this.viewer.scene.remove(this.parallelHelperLine);
    this.viewer.scene.remove(this.perpendicularHelperLine);
  }

  addVerticalHelperLine() {
    this.updateVerticalHelperLine();
    this.viewer.scene.add(this.verticalHelperLine);
  }

  updateVerticalHelperLine() {
    const points = [this.lashPositionProjectedOnFloor, this.lashPosition];
    this.verticalHelperLine.setBetweenPoints(points);
  }

  removeVerticalHelperLine() {
    this.viewer.scene.remove(this.verticalHelperLine);
  }

  checkCollisions() {
    this.bipodIsColliding = false;
    this.viewer.domElement.style.cursor = "default";

    for (const pole of this.viewer.inventory.poles) {
      if (this.scaffold1.overlaps(pole) || this.scaffold2.overlaps(pole)) {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 0, 0);
        if (this.lashPositionPlaced) {
          this.bipodIsColliding = true;
          this.viewer.domElement.style.cursor = "not-allowed";
        }
      } else {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 1, 1);
      }
    }
  }
}
