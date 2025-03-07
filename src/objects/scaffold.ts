import * as THREE from "three";
import { Pole } from "../objects/pole";
import { Viewer } from "./../viewer";

export class Scaffold {
  mainPole: Pole;
  extensionPole: Pole;
  splintPole: Pole;

  length: number = 0.0;
  mainRadius: number = 0.0;
  direction: THREE.Vector3 = new THREE.Vector3();

  constructor() {
    this.mainPole = new Pole();
    this.mainRadius = this.mainPole.radius;
    this.splintPole = new Pole();
    this.extensionPole = new Pole();
  }

  setMainPole(pole: Pole) {
    this.mainPole = pole;
    this.length = pole.length;
    this.direction = pole.direction;
  }

  reset() {
    this.setDirection(new THREE.Vector3(0, 1, 0));
    this.setLength(4.0);
    this.setPositions(new THREE.Vector3(0, 200, 0));
  }

  setDirection(direction: THREE.Vector3) {
    this.direction = direction.clone().normalize();
    for (const pole of [this.mainPole, this.extensionPole, this.splintPole]) {
      pole.setDirection(direction);
    }
  }

  setPositionOnGround(groundPosition: THREE.Vector3) {
    this.setDirection(new THREE.Vector3(0, 1, 0));
    this.setLength(4.0);
    const targetPosition = groundPosition
      .clone()
      .add(new THREE.Vector3(0, this.mainPole.length / 2.0, 0));
    this.setPositions(targetPosition);
  }

  setPositionBetweenGroundAndPole(
    groundPoint: THREE.Vector3,
    polePoint: THREE.Vector3
  ) {
    const targetOrientationVector = polePoint.clone().sub(groundPoint.clone());
    const distance = targetOrientationVector.length();
    this.setLength(distance + 0.15);
    this.setDirection(targetOrientationVector);
    const targetPosition = groundPoint
      .clone()
      .add(
        this.mainPole.direction
          .clone()
          .multiplyScalar(this.mainPole.length / 2.0)
      );
    this.setPositions(targetPosition);
  }

  setPositionBetweenTwoPoles(pointA: THREE.Vector3, pointB: THREE.Vector3) {
    const targetOrientationVector = pointB.clone().sub(pointA.clone());
    const distance = targetOrientationVector.length();
    this.setLength(distance + 0.3);
    this.setDirection(targetOrientationVector);

    const centerPoint = pointA.clone().add(pointB.clone()).divideScalar(2.0);
    const targetPosition = centerPoint
      .clone()
      .sub(
        this.direction
          .clone()
          .multiplyScalar((this.length - this.mainPole.length) / 2.0)
      );
    this.setPositions(targetPosition);
  }

  setLength(minimumLength: number) {
    let newLength = 12.0;
    const allowedLengths: number[] = [
      1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0,
      12.0 /*16.0, 20.0, 24.0,
      28.0, 32.0, 36.0, 40.0,*/,
    ];
    for (const length of allowedLengths) {
      if (length >= minimumLength) {
        newLength = length;
        break;
      }
    }
    if (newLength === this.length) return;

    this.length = newLength;

    if (this.length <= 6.0) {
      this.changeLengthToSinglePole();
    } else if (this.length === 8.0) {
      this.changeLengthTo8();
    } else if (this.length === 10.0) {
      this.changeLengthTo10();
    } else {
      this.changeLengthTo12();
    }
    this.mainRadius = this.mainPole.radius;
  }

  changeLengthToSinglePole() {
    this.mainPole.setLength(this.length);
    this.extensionPole.visible = false;
    this.splintPole.visible = false;
  }

  changeLengthTo8() {
    this.mainPole.setLength(4.0);
    this.extensionPole.setLength(4.0);
    this.splintPole.setLength(4.0);
    this.extensionPole.visible = true;
    this.splintPole.visible = true;
  }

  changeLengthTo10() {
    this.mainPole.setLength(5.0);
    this.extensionPole.setLength(5.0);
    this.splintPole.setLength(4.0);
    this.extensionPole.visible = true;
    this.splintPole.visible = true;
  }

  changeLengthTo12() {
    this.mainPole.setLength(6.0);
    this.extensionPole.setLength(6.0);
    this.splintPole.setLength(4.0);
    this.extensionPole.visible = true;
    this.splintPole.visible = true;
  }

  setPositions(position: THREE.Vector3) {
    this.mainPole.position.set(position.x, position.y, position.z);
    const extensionPosition = position
      .clone()
      .add(
        this.mainPole.direction.clone().multiplyScalar(this.mainPole.length)
      );
    this.extensionPole.position.set(
      extensionPosition.x,
      extensionPosition.y,
      extensionPosition.z
    );

    const splintPosition = position
      .clone()
      .add(
        this.mainPole.direction
          .clone()
          .multiplyScalar(this.mainPole.length * 0.5)
      );
    const splintOffset = this.mainRadius + this.splintPole.radius;
    if (this.splintPole.isVertical()) {
      this.splintPole.position.set(
        splintPosition.x - splintOffset,
        splintPosition.y,
        splintPosition.z
      );
    } else {
      const offsetPosition = new THREE.Vector3(0, 1, 0)
        .cross(this.direction)
        .cross(this.direction)
        .normalize()
        .multiplyScalar(splintOffset)
        .add(splintPosition);
      this.splintPole.position.set(
        offsetPosition.x,
        offsetPosition.y,
        offsetPosition.z
      );
    }
  }

  resize(resizeAtTop: boolean, newMinimumLength: number) {
    const oldLength = this.length;
    const oldLengthMainPole = this.mainPole.length;
    this.setLength(newMinimumLength);
    const lengthDifference = this.length - oldLength;
    const lengthDifferenceMainPole = this.mainPole.length - oldLengthMainPole;
    this.setDirection(this.direction);

    const positionOffset = resizeAtTop
      ? this.direction.clone().multiplyScalar(lengthDifferenceMainPole / 2)
      : this.direction
          .clone()
          .multiplyScalar(lengthDifferenceMainPole / 2 - lengthDifference);
    const newPosition = this.mainPole.position.clone().add(positionOffset);
    this.setPositions(newPosition);
  }

  isParallelTo(direction: THREE.Vector3) {
    return this.mainPole.isParallelTo(direction);
  }

  isVertical() {
    return this.isParallelTo(new THREE.Vector3(0, 1, 0));
  }

  getCenter() {
    return this.mainPole.position
      .clone()
      .sub(this.direction.clone().multiplyScalar(this.mainPole.length / 2.0))
      .add(this.direction.clone().multiplyScalar(this.length / 2.0));
  }

  overlaps(otherPole: Pole) {
    let overlaps = false;
    for (const pole of [this.mainPole, this.extensionPole, this.splintPole]) {
      overlaps ||= pole.overlaps(otherPole) && pole.visible;
    }
    return overlaps;
  }

  addToScene(scene: THREE.Scene) {
    for (const pole of [this.mainPole, this.extensionPole, this.splintPole]) {
      scene.add(pole);
    }
  }

  addExtensionToScene(scene: THREE.Scene) {
    for (const pole of [this.extensionPole, this.splintPole]) {
      scene.add(pole);
      pole.visible = false;
    }
  }

  removeFromScene(scene: THREE.Scene) {
    for (const pole of [this.mainPole, this.extensionPole, this.splintPole]) {
      scene.remove(pole);
    }
  }

  removeExtensionFromScene(scene: THREE.Scene) {
    for (const pole of [this.extensionPole, this.splintPole]) {
      scene.remove(pole);
    }
  }

  addToViewer(viewer: Viewer) {
    for (const pole of [this.mainPole, this.extensionPole, this.splintPole]) {
      if (pole.visible) {
        viewer.inventory.addPoles([pole]);
      } else {
        viewer.scene.remove(pole);
      }
    }
  }

  addExtensionToViewer(viewer: Viewer) {
    for (const pole of [this.extensionPole, this.splintPole]) {
      if (pole.visible) {
        viewer.inventory.addPoles([pole]);
      } else {
        viewer.scene.remove(pole);
      }
    }
  }

  setVisible() {
    if (this.length > 6.0) {
      this.mainPole.visible = true;
      this.extensionPole.visible = true;
      this.splintPole.visible = true;
    } else {
      this.mainPole.visible = true;
      this.extensionPole.visible = false;
      this.splintPole.visible = false;
    }
  }

  setInvisible() {
    this.mainPole.visible = false;
    this.extensionPole.visible = false;
    this.splintPole.visible = false;
  }
}
