import * as THREE from "three";
import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class TripodTool {
  active: boolean = false;
  viewer: Viewer;

  pole1: Pole = new Pole();
  pole2: Pole = new Pole();
  pole3: Pole = new Pole();

  pole1Placed: boolean = false;
  pole2Placed: boolean = false;
  pole3Placed: boolean = false;
  lashPositionPlaced: boolean = false;

  firstGroundPoint: THREE.Vector3 = new THREE.Vector3();
  secondGroundPoint: THREE.Vector3 = new THREE.Vector3();
  thirdGroundPoint: THREE.Vector3 = new THREE.Vector3();
  lashPosition: THREE.Vector3 = new THREE.Vector3();
  lashPositionProjectedOnFloor: THREE.Vector3 = new THREE.Vector3();
  defaultLashHeight: number = 3.0;
  lashHeight: number = this.defaultLashHeight;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  activate() {
    this.active = true;
    this.viewer.scene.add(this.pole1);
    this.viewer.scene.add(this.pole2);
    this.viewer.scene.add(this.pole3);
  }

  deactivate() {
    this.active = false;
    this.viewer.scene.remove(this.pole1);
    this.viewer.scene.remove(this.pole2);
    this.viewer.scene.remove(this.pole3);
    this.resetParameters();
  }

  resetParameters() {
    this.pole1Placed = false;
    this.pole2Placed = false;
    this.pole3Placed = false;
    this.lashPositionPlaced = false;
    this.lashHeight = this.defaultLashHeight;
  }

  leftClick() {
    if (!this.pole1Placed) {
      this.pole1Placed = true;
    } else if (!this.pole2Placed) {
      this.pole2Placed = true;
    } else {
      this.viewer.poles.push(this.pole1);
      this.viewer.poles.push(this.pole2);
      this.viewer.poles.push(this.pole3);
      this.pole1 = new Pole();
      this.pole2 = new Pole();
      this.pole3 = new Pole();
      this.viewer.scene.add(this.pole1);
      this.viewer.scene.add(this.pole2);
      this.viewer.scene.add(this.pole3);
      this.resetParameters();
    }
  }

  rightClick() {
    if (!this.active) return;

    if (this.pole2Placed) {
      this.pole2Placed = false;
    } else if (this.pole1Placed) {
      this.pole1Placed = false;
    } else {
      this.resetParameters();
    }
  }

  drawTripod(groundPosition: THREE.Vector3) {
    if (!this.pole1Placed) {
      this.drawFirstStep(groundPosition);
    } else if (!this.pole2Placed) {
      this.drawSecondStep(groundPosition);
    } else if (!this.pole3Placed) {
      this.drawThirdStep(groundPosition);
    }
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.pole1.setPositionOnGround(groundPosition);
    this.pole2.setPositionOnGround(
      groundPosition
        .clone()
        .add(new THREE.Vector3(this.pole1.radius + this.pole2.radius, 0, 0))
    );
    this.pole3.setPositionOnGround(
      groundPosition
        .clone()
        .sub(new THREE.Vector3(this.pole1.radius + this.pole3.radius, 0, 0))
    );
    this.firstGroundPoint = groundPosition;
  }

  drawSecondStep(groundPosition: THREE.Vector3) {
    this.secondGroundPoint = groundPosition;
    const thirdGroundPointOffset = new THREE.Vector3()
      .crossVectors(
        this.firstGroundPoint.clone().sub(this.secondGroundPoint),
        new THREE.Vector3(0, 1, 0)
      )
      .normalize()
      .multiplyScalar(this.pole1.radius + this.pole3.radius);
    this.thirdGroundPoint = this.firstGroundPoint
      .clone()
      .sub(thirdGroundPointOffset);
    this.lashPositionProjectedOnFloor = this.getCenter(
      this.firstGroundPoint,
      this.secondGroundPoint
    );
    this.calculatePositions();
  }

  drawThirdStep(groundPosition: THREE.Vector3) {
    this.thirdGroundPoint = groundPosition;
    this.lashPositionProjectedOnFloor = this.getCenter(
      this.firstGroundPoint,
      this.secondGroundPoint,
      this.thirdGroundPoint
    );
    this.calculatePositions();
  }

  calculatePositions() {
    const lashingOffset12 = new THREE.Vector3()
      .crossVectors(this.pole1.direction, this.pole2.direction)
      .normalize()
      .multiplyScalar(this.pole1.radius + this.pole2.radius);

    let lashingOffset13 = new THREE.Vector3();
    if (this.pole3.isParallelTo(this.pole1.direction)) {
      lashingOffset13
        .crossVectors(this.pole1.direction, this.pole2.direction)
        .normalize()
        .multiplyScalar(this.pole1.radius + this.pole3.radius);
    } else {
      lashingOffset13
        .crossVectors(this.pole1.direction, this.pole3.direction)
        .normalize()
        .multiplyScalar(this.pole1.radius + this.pole3.radius);
    }

    this.lashPosition = new THREE.Vector3(
      this.lashPositionProjectedOnFloor.x,
      this.lashHeight,
      this.lashPositionProjectedOnFloor.z
    );

    const centerPole1 = this.lashPosition.clone();
    const centerPole2 = this.lashPosition.clone().sub(lashingOffset12);
    const centerPole3 = this.lashPosition.clone().add(lashingOffset13);

    this.pole1.setPositionBetweenGroundAndPole(
      this.firstGroundPoint,
      centerPole1
    );
    this.pole2.setPositionBetweenGroundAndPole(
      this.secondGroundPoint,
      centerPole2
    );
    this.pole3.setPositionBetweenGroundAndPole(
      this.thirdGroundPoint,
      centerPole3
    );
  }

  getCenter(p1: THREE.Vector3, p2: THREE.Vector3, p3?: THREE.Vector3) {
    return p3
      ? p1.clone().add(p2).add(p3).divideScalar(3.0)
      : p1.clone().add(p2).divideScalar(2.0);
  }
}
