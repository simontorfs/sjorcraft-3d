import * as THREE from "three";
import { Pole } from "./pole";

export class Scaffold {
  pole: Pole;
  pole2: Pole;
  splint: Pole;

  length: number = 0;
  direction: THREE.Vector3 = new THREE.Vector3();

  constructor(pole: Pole) {
    this.pole = pole;
    this.pole2 = new Pole();
    this.splint = new Pole();
  }

  setPositionBetweenGroundAndPole(
    groundPoint: THREE.Vector3,
    polePoint: THREE.Vector3
  ) {
    const targetOrientationVector = polePoint.clone().sub(groundPoint.clone());
    const distance = targetOrientationVector.length();
    this.setLength(distance + 0.15);
    this.setDirection(targetOrientationVector);
    const targetPositionPole1 = groundPoint
      .clone()
      .add(this.direction.clone().multiplyScalar(this.pole.length / 2.0));
    this.pole.position.set(
      targetPositionPole1.x,
      targetPositionPole1.y,
      targetPositionPole1.z
    );
    const targetPositionPole2 = groundPoint
      .clone()
      .add(this.direction.clone().multiplyScalar((3 * this.pole.length) / 2.0));
    this.pole2.position.set(
      targetPositionPole2.x,
      targetPositionPole2.y,
      targetPositionPole2.z
    );
    const splintPosition = groundPoint
      .clone()
      .add(this.direction.clone().multiplyScalar(this.pole.length));
    this.splint.position.set(
      splintPosition.x,
      splintPosition.y - 0.12,
      splintPosition.z
    );
  }

  setLength(minimumLength: number) {
    if (minimumLength < 6.0) return;
    if (minimumLength < 12.0) {
      this.length = Math.round(minimumLength + 2.0 - (minimumLength % 2));
    } else {
      this.length = Math.round(minimumLength + 4.0 - (minimumLength % 4));
    }
    if (this.length === 8.0) {
      this.pole.setLength(4.0);
      this.pole2.setLength(4.0);
      this.splint.setLength(4.0);
    }
  }

  setDirection(direction: THREE.Vector3) {
    this.direction = direction.clone().normalize();
    this.pole.setDirection(this.direction);
    this.pole2.setDirection(this.direction);
    this.splint.setDirection(this.direction);
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.pole2);
    scene.add(this.splint);
  }

  removeFromScene(scene: THREE.Scene) {
    scene.remove(this.pole2);
    scene.remove(this.splint);
  }
}
