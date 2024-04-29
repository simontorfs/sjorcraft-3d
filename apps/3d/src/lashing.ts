import { Pole } from "./pole";
import * as THREE from "three";

export class Lashing {
  fixedPole: Pole;
  loosePole: Pole;
  centerFixedPole: THREE.Vector3;
  centerLoosePole: THREE.Vector3;
  anchorPoint: THREE.Vector3; // Point on the surface of the fixed pole where the user clicked
  anchorPointNormal: THREE.Vector3;
  fixedHeight: number | undefined;
  constructor() {}

  setProperties(
    fixedPole: Pole,
    loosePole: Pole,
    position: THREE.Vector3,
    normal: THREE.Vector3
  ) {
    this.fixedPole = fixedPole;
    this.loosePole = loosePole;
    this.anchorPoint = position;
    this.anchorPointNormal = normal;
    this.calculatePositions();
  }

  calculatePositions() {
    this.centerFixedPole = this.anchorPoint
      .clone()
      .sub(this.anchorPointNormal.clone().multiplyScalar(0.07));

    const centerDifference = new THREE.Vector3()
      .crossVectors(this.fixedPole.direction, this.loosePole.direction)
      .normalize()
      .multiplyScalar(0.14);

    const centerLoosePoleOption1 = this.centerFixedPole
      .clone()
      .add(centerDifference);
    const centerLoosePoleOption2 = this.centerFixedPole
      .clone()
      .sub(centerDifference);
    const distanceOption1 = this.anchorPoint.distanceTo(centerLoosePoleOption1);
    const distanceOption2 = this.anchorPoint.distanceTo(centerLoosePoleOption2);

    if (distanceOption1 < distanceOption2) {
      this.centerLoosePole = centerLoosePoleOption1;
    } else {
      this.centerLoosePole = centerLoosePoleOption2;
    }

    if (this.fixedHeight) {
      this.calculatePositionsWithHorizontalSnap(this.fixedHeight);
    }
  }

  calculatePositionsWithHorizontalSnap(desiredHeight: number) {
    // Move the center of the loose pole along the fixed pole direction until it is on the desired height.
    const heightDifference = this.centerLoosePole.y - desiredHeight;
    const translationDistance = heightDifference / this.fixedPole.direction.y;
    if (Math.abs(translationDistance) < 0.1) {
      const translationVector = this.fixedPole.direction
        .clone()
        .multiplyScalar(translationDistance);
      this.centerLoosePole.sub(translationVector);
      return true;
    }
    return false;
  }

  commit() {
    this.fixedPole.addLashing(this);
    this.loosePole.addLashing(this);
  }
}
