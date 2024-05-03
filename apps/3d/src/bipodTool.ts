import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

export class BipodTool {
  active: boolean;
  viewer: Viewer;

  pole1: Pole;
  pole2: Pole;

  pole1Placed: boolean = false;
  pole2Placed: boolean = false;

  firstGroundPoint: THREE.Vector3;
  secondGroundPoint: THREE.Vector3;

  center: THREE.Vector3;
  perpendicularDirection: THREE.Vector3;

  constructor(viewer: Viewer) {
    this.active = false;
    this.viewer = viewer;
    this.pole1 = new Pole();
    this.pole2 = new Pole();
    this.firstGroundPoint = new THREE.Vector3();
    this.secondGroundPoint = new THREE.Vector3();
    this.center = new THREE.Vector3();
    this.perpendicularDirection = new THREE.Vector3();
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
    this.pole1Placed = false;
    this.pole2Placed = false;
  }

  drawBipod(groundPosition: THREE.Vector3) {
    if (!this.pole1Placed) {
      this.drawFirstStep(groundPosition);
    } else if (!this.pole2Placed) {
      this.drawSecondStep(groundPosition);
    } else {
      this.drawThirdStep(groundPosition);
    }
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.pole1.setPositionOnGround(groundPosition);
    this.pole2.setPositionOnGround(
      groundPosition.clone().add(new THREE.Vector3(0.14, 0, 0))
    );
    this.firstGroundPoint = groundPosition;
  }

  drawSecondStep(groundPosition: THREE.Vector3) {
    this.secondGroundPoint = groundPosition;
    this.setLashingPosition(groundPosition);
  }

  drawThirdStep(groundPosition: THREE.Vector3) {
    this.setLashingPosition(groundPosition);
  }

  setLashingPosition(groundPosition: THREE.Vector3) {
    this.calculatePerpendicularDirection();

    const lashPosition = new THREE.Vector3(
      groundPosition.x,
      2.8,
      groundPosition.z
    );

    const centerPole1 = lashPosition.clone().add(this.perpendicularDirection);
    const centerPole2 = lashPosition.clone().sub(this.perpendicularDirection);

    this.pole1.setPositionBetweenGroundAndPole(
      this.firstGroundPoint,
      centerPole1
    );
    this.pole2.setPositionBetweenGroundAndPole(
      this.secondGroundPoint,
      centerPole2
    );
  }

  initThirdStep() {
    this.center = this.firstGroundPoint
      .clone()
      .add(this.secondGroundPoint)
      .divideScalar(2.0);

    const points = [this.firstGroundPoint, this.secondGroundPoint];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color: 0x0000ff,
      dashSize: 0.05,
      gapSize: 0.05,
    });

    const axis = new THREE.Line(geometry, material);
    axis.computeLineDistances();
    this.viewer.scene.add(axis);

    const perpendicularDirection = new THREE.Vector3()
      .crossVectors(
        this.firstGroundPoint.clone().sub(this.secondGroundPoint),
        new THREE.Vector3(0, 1, 0)
      )
      .normalize();
    const perpendicularGeometry = new THREE.BufferGeometry().setFromPoints([
      this.center.clone().add(perpendicularDirection.clone().multiplyScalar(5)),
      this.center.clone().sub(perpendicularDirection.clone().multiplyScalar(5)),
    ]);

    const perpendicularAxis = new THREE.Line(perpendicularGeometry, material);
    perpendicularAxis.computeLineDistances();
    this.viewer.scene.add(perpendicularAxis);
  }

  calculatePerpendicularDirection() {
    this.perpendicularDirection = new THREE.Vector3()
      .crossVectors(this.pole1.direction, this.pole2.direction)
      .normalize()
      .multiplyScalar(0.07);
  }

  leftClick() {
    if (!this.active) return;

    if (!this.pole1Placed) {
      this.pole1Placed = true;
    } else if (!this.pole2Placed) {
      this.pole2Placed = true;
      this.initThirdStep();
    } else {
      this.viewer.poles.push(this.pole1);
      this.viewer.poles.push(this.pole2);
      this.pole1 = new Pole();
      this.pole2 = new Pole();
      this.viewer.scene.add(this.pole1);
      this.viewer.scene.add(this.pole2);
      this.pole1Placed = false;
      this.pole2Placed = false;
    }
  }
}
