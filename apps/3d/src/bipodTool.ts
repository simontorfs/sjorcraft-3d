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
  lashPositionPlaced: boolean = false;

  firstGroundPoint: THREE.Vector3;
  secondGroundPoint: THREE.Vector3;
  lashPosition: THREE.Vector3;
  lashHeight: number;
  defaultLashHeight: number = 2.8;

  parallelHelperLine: THREE.Line;
  perpendicularHelperLine: THREE.Line;
  verticalHelperLine: THREE.Line;
  helperPlane: THREE.Plane = new THREE.Plane();

  constructor(viewer: Viewer) {
    this.active = false;
    this.viewer = viewer;
    this.pole1 = new Pole();
    this.pole2 = new Pole();
    this.firstGroundPoint = new THREE.Vector3();
    this.secondGroundPoint = new THREE.Vector3();
    this.lashHeight = this.defaultLashHeight;
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
    this.lashPositionPlaced = false;
    this.lashHeight = this.defaultLashHeight;
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
      groundPosition.clone().add(new THREE.Vector3(0.14, 0, 0))
    );
    this.firstGroundPoint = groundPosition;
  }

  drawSecondStep(groundPosition: THREE.Vector3) {
    this.secondGroundPoint = groundPosition;
    this.setLashingPosition(this.getCenter());
  }

  drawThirdStep(groundPosition: THREE.Vector3) {
    this.setLashingPosition(groundPosition);
  }

  drawFourthStep(groundPosition: THREE.Vector3) {
    this.setHelperPlane();
    this.updateVerticalHelperLine();
    const line = new THREE.Line3(this.viewer.camera.position, groundPosition);

    let target: THREE.Vector3 = new THREE.Vector3();
    this.helperPlane.intersectLine(line, target);
    this.lashHeight = target.y;
    this.setLashingPosition(this.lashPosition);
  }

  setLashingPosition(groundPosition: THREE.Vector3) {
    const lashingOffset = new THREE.Vector3()
      .crossVectors(this.pole1.direction, this.pole2.direction)
      .normalize()
      .multiplyScalar(0.07);

    this.lashPosition = new THREE.Vector3(
      groundPosition.x,
      this.lashHeight,
      groundPosition.z
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
    const center = this.getCenter();

    const points = [this.firstGroundPoint, this.secondGroundPoint];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color: 0x0000ff,
      dashSize: 0.05,
      gapSize: 0.05,
    });

    this.parallelHelperLine = new THREE.Line(geometry, material);
    this.parallelHelperLine.computeLineDistances();
    this.viewer.scene.add(this.parallelHelperLine);

    const perpendicularDirection = new THREE.Vector3()
      .crossVectors(
        this.firstGroundPoint.clone().sub(this.secondGroundPoint),
        new THREE.Vector3(0, 1, 0)
      )
      .normalize();
    const perpendicularGeometry = new THREE.BufferGeometry().setFromPoints([
      center.clone().add(perpendicularDirection.clone().multiplyScalar(5)),
      center.clone().sub(perpendicularDirection.clone().multiplyScalar(5)),
    ]);

    this.perpendicularHelperLine = new THREE.Line(
      perpendicularGeometry,
      material
    );
    this.perpendicularHelperLine.computeLineDistances();
    this.viewer.scene.add(this.perpendicularHelperLine);
  }

  removeHorizontalHelperLines() {
    this.viewer.scene.remove(this.parallelHelperLine);
    this.viewer.scene.remove(this.perpendicularHelperLine);
  }

  addVerticalHelperLine() {
    const points = [
      this.lashPosition,
      new THREE.Vector3(this.lashPosition.x, 0, this.lashPosition.z),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color: 0x0000ff,
      dashSize: 0.05,
      gapSize: 0.05,
    });

    this.verticalHelperLine = new THREE.Line(geometry, material);
    this.verticalHelperLine.computeLineDistances();
    this.viewer.scene.add(this.verticalHelperLine);
  }

  updateVerticalHelperLine() {
    const points = [
      new THREE.Vector3(this.lashPosition.x, 0, this.lashPosition.z),
      this.lashPosition,
    ];
    this.verticalHelperLine.geometry.setFromPoints(points);
    this.verticalHelperLine.computeLineDistances();
  }

  removeVerticalHelperLine() {
    this.viewer.scene.remove(this.verticalHelperLine);
  }

  setHelperPlane() {
    const v = this.viewer.camera.position
      .clone()
      .sub(this.lashPosition)
      .normalize();
    this.helperPlane.setFromNormalAndCoplanarPoint(v, this.lashPosition);
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
      this.setHelperPlane();
    } else {
      this.removeVerticalHelperLine();
      this.viewer.poles.push(this.pole1);
      this.viewer.poles.push(this.pole2);
      this.pole1 = new Pole();
      this.pole2 = new Pole();
      this.viewer.scene.add(this.pole1);
      this.viewer.scene.add(this.pole2);
      this.pole1Placed = false;
      this.pole2Placed = false;
      this.lashPositionPlaced = false;
      this.lashHeight = this.defaultLashHeight;
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
    }
  }
}
