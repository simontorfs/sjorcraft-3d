import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { HelperLine } from "./helperLine";

export class BipodTool {
  active: boolean = false;
  viewer: Viewer;

  pole1: Pole = new Pole();
  pole2: Pole = new Pole();

  pole1Placed: boolean = false;
  pole2Placed: boolean = false;
  lashPositionPlaced: boolean = false;

  firstGroundPoint: THREE.Vector3 = new THREE.Vector3();
  secondGroundPoint: THREE.Vector3 = new THREE.Vector3();
  lashPosition: THREE.Vector3 = new THREE.Vector3();
  lashPositionProjectedOnFloor: THREE.Vector3 = new THREE.Vector3();
  defaultLashHeight: number = 2.8;
  lashHeight: number = this.defaultLashHeight;

  parallelHelperLine: HelperLine = new HelperLine();
  perpendicularHelperLine: HelperLine = new HelperLine();
  verticalHelperLine: HelperLine = new HelperLine();
  helperPlane: THREE.Plane = new THREE.Plane();

  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  activate() {
    this.active = true;
    this.viewer.scene.add(this.pole1);
    this.viewer.scene.add(this.pole2);
  }

  deactivate() {
    this.active = false;
    this.viewer.scene.remove(this.pole1);
    this.viewer.scene.remove(this.pole2);
    this.resetParameters();
  }

  resetParameters() {
    this.pole1Placed = false;
    this.pole2Placed = false;
    this.lashPositionPlaced = false;
    this.lashHeight = this.defaultLashHeight;
  }

  leftClick() {
    if (!this.active) return;

    if (!this.pole1Placed) {
      this.pole1Placed = true;
    } else if (!this.pole2Placed) {
      this.pole2Placed = true;
      this.AddHorizontalHelperLines();
    } else if (!this.lashPositionPlaced) {
      this.lashPositionPlaced = true;
      this.removeHorizontalHelperLines();
      this.addVerticalHelperLine();
    } else {
      this.removeVerticalHelperLine();
      this.viewer.poles.push(this.pole1);
      this.viewer.poles.push(this.pole2);
      this.pole1 = new Pole();
      this.pole2 = new Pole();
      this.viewer.scene.add(this.pole1);
      this.viewer.scene.add(this.pole2);
      this.resetParameters();
    }
  }

  rightClick() {
    if (!this.active) return;

    if (this.lashPositionPlaced) {
      this.lashPositionPlaced = false;
      this.removeVerticalHelperLine();
      this.AddHorizontalHelperLines();
    } else if (this.pole2Placed) {
      this.pole2Placed = false;
      this.removeHorizontalHelperLines();
    } else if (this.pole1Placed) {
      this.pole1Placed = false;
    } else {
      this.resetParameters();
    }
  }

  drawBipod(groundPosition: THREE.Vector3) {
    if (!this.pole1Placed) {
      this.drawFirstStep(groundPosition);
    } else if (!this.pole2Placed) {
      this.drawSecondStep(groundPosition);
    } else if (!this.lashPositionPlaced) {
      this.drawThirdStep(groundPosition);
    } else {
      this.drawFourthStep(groundPosition);
    }
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.pole1.setPositionOnGround(groundPosition);
    this.pole2.setPositionOnGround(
      groundPosition
        .clone()
        .add(new THREE.Vector3(this.pole1.radius + this.pole2.radius, 0, 0))
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

  drawFourthStep(groundPosition: THREE.Vector3) {
    this.setHelperPlane();
    const lineOfSightToMouse = new THREE.Line3(
      this.viewer.camera.position,
      groundPosition
    );
    let target: THREE.Vector3 = new THREE.Vector3();
    this.helperPlane.intersectLine(lineOfSightToMouse, target);
    this.lashHeight = target.y;

    this.calculatePositions();
    this.updateVerticalHelperLine();
  }

  calculatePositions() {
    const lashingOffset = new THREE.Vector3()
      .crossVectors(this.pole1.direction, this.pole2.direction)
      .normalize()
      .multiplyScalar((this.pole1.radius + this.pole2.radius) / 2.0);

    this.lashPosition = new THREE.Vector3(
      this.lashPositionProjectedOnFloor.x,
      this.lashHeight,
      this.lashPositionProjectedOnFloor.z
    );

    const centerPole1 = this.lashPosition.clone().add(lashingOffset);
    const centerPole2 = this.lashPosition.clone().sub(lashingOffset);

    this.pole1.setPositionBetweenGroundAndPole(
      this.firstGroundPoint,
      centerPole1
    );
    this.pole2.setPositionBetweenGroundAndPole(
      this.secondGroundPoint,
      centerPole2
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

  setHelperPlane() {
    const lineOfSightToLashing = this.viewer.camera.position
      .clone()
      .sub(this.lashPosition)
      .normalize();
    this.helperPlane.setFromNormalAndCoplanarPoint(
      lineOfSightToLashing,
      this.lashPosition
    );
  }
}
