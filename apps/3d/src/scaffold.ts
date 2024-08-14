import * as THREE from "three";
import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class Scaffold {
  mainPole: Pole;
  extensionPoles: Pole[] = [];
  splintPoles: Pole[] = [];

  length: number = 0.0;
  mainRadius: number = 0.0;
  direction: THREE.Vector3 = new THREE.Vector3();

  constructor() {
    this.mainPole = new Pole();
    this.mainRadius = this.mainPole.radius;
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
    for (const pole of [
      this.mainPole,
      ...this.extensionPoles,
      ...this.splintPoles,
    ]) {
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
    let newLength = 0.0;
    const allowedLengths: number[] = [
      1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 12.0, 16.0, 20.0, 24.0,
      28.0, 32.0, 36.0, 40.0,
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
    } else if (this.length === 10.0) {
      this.changeLengthTo10();
    } else if (this.length === 12.0) {
      this.changeLengthTo12();
    } else {
      this.changeLengthTox4(this.length / 4);
    }
    this.mainRadius = this.mainPole.radius;
  }

  changeLengthToSinglePole() {
    const scene = this.mainPole.parent as THREE.Scene;
    this.removeFromScene(scene);
    this.mainPole.setLength(this.length);
    this.extensionPoles = [];
    this.splintPoles = [];
    this.addToScene(scene);
  }

  changeLengthTo10() {
    const scene = this.mainPole.parent as THREE.Scene;
    this.removeFromScene(scene);
    this.mainPole.setLength(5.0);
    const extension = new Pole();
    const splint = new Pole();
    extension.setLength(5.0);
    splint.setLength(4.0);
    this.extensionPoles = [extension];
    this.splintPoles = [splint];
    this.addToScene(scene);
  }

  changeLengthTo12() {
    const scene = this.mainPole.parent as THREE.Scene;
    this.removeFromScene(scene);
    this.mainPole.setLength(6.0);
    const extension = new Pole();
    const splint = new Pole();
    extension.setLength(6.0);
    splint.setLength(4.0);
    this.extensionPoles = [extension];
    this.splintPoles = [splint];
    this.addToScene(scene);
  }

  changeLengthTox4(x: number) {
    const scene = this.mainPole.parent as THREE.Scene;
    this.removeFromScene(scene);
    this.extensionPoles = [];
    this.splintPoles = [];
    this.mainPole.setLength(4.0);
    for (let index = 1; index < x; index++) {
      const extension = new Pole();
      const splint = new Pole();
      extension.setLength(4.0);
      splint.setLength(4.0);
      this.extensionPoles.push(extension);
      this.splintPoles.push(splint);
    }
    this.addToScene(scene);
  }

  setPositions(position: THREE.Vector3) {
    this.mainPole.position.set(position.x, position.y, position.z);
    for (let index = 0; index < this.extensionPoles.length; index++) {
      const pos = position
        .clone()
        .add(
          this.mainPole.direction
            .clone()
            .multiplyScalar(this.mainPole.length * (index + 1))
        );
      this.extensionPoles[index].position.set(pos.x, pos.y, pos.z);
    }

    for (let index = 0; index < this.splintPoles.length; index++) {
      const pos = position
        .clone()
        .add(
          this.mainPole.direction
            .clone()
            .multiplyScalar(this.mainPole.length * (index + 0.5))
        );
      const splintOffset = this.mainRadius + this.splintPoles[index].radius;
      if (this.splintPoles[index].isVertical()) {
        this.splintPoles[index].position.set(
          pos.x - splintOffset,
          pos.y,
          pos.z
        );
      } else {
        const offsetPosition = new THREE.Vector3(0, 1, 0)
          .cross(this.direction)
          .cross(this.direction)
          .normalize()
          .multiplyScalar(splintOffset)
          .add(pos);
        this.splintPoles[index].position.set(
          offsetPosition.x,
          offsetPosition.y,
          offsetPosition.z
        );
      }
    }
  }

  resize(resizeAtTop: boolean, newMinimumLength: number) {
    const oldLength = this.length;
    this.setLength(Math.min(newMinimumLength, 6.0)); // Set max to 6.0 for now. In the future we want to make scaffolds here.
    const lengthDifference = this.length - oldLength;
    this.setDirection(this.direction);
    const positionOffset = this.direction
      .clone()
      .multiplyScalar(lengthDifference / 2);

    if (resizeAtTop) {
      const newPosition = this.mainPole.position.clone().add(positionOffset);
      this.setPositions(newPosition);
    } else {
      const newPosition = this.mainPole.position.clone().sub(positionOffset);
      this.setPositions(newPosition);
    }
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
    for (const pole of [
      this.mainPole,
      ...this.extensionPoles,
      ...this.splintPoles,
    ]) {
      overlaps ||= pole.overlaps(otherPole);
    }
    return overlaps;
  }

  addToScene(scene: THREE.Scene) {
    for (const pole of [
      this.mainPole,
      ...this.extensionPoles,
      ...this.splintPoles,
    ]) {
      scene.add(pole);
    }
  }

  removeFromScene(scene: THREE.Scene) {
    for (const pole of [
      this.mainPole,
      ...this.extensionPoles,
      ...this.splintPoles,
    ]) {
      scene.remove(pole);
    }
  }

  addToViewer(viewer: Viewer) {
    for (const pole of [
      this.mainPole,
      ...this.extensionPoles,
      ...this.splintPoles,
    ]) {
      viewer.poles.push(pole);
    }
  }

  addExtensionToViewer(viewer: Viewer) {
    for (const pole of [...this.extensionPoles, ...this.splintPoles]) {
      viewer.poles.push(pole);
    }
  }
}
