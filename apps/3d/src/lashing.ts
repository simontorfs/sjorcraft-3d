import { Pole } from "./pole";
import * as THREE from "three";

export class Lashing {
  pole1: Pole;
  pole2: Pole;
  centerPole1: THREE.Vector3;
  centerPole2: THREE.Vector3;
  constructor(
    pole1: Pole,
    pole2: Pole,
    position: THREE.Vector3,
    normal: THREE.Vector3
  ) {
    this.pole1 = pole1;
    this.pole2 = pole2;
    this.update(position, normal);
  }

  update(position: THREE.Vector3, normal: THREE.Vector3) {
    this.centerPole1 = position
      .clone()
      .sub(normal.clone().multiplyScalar(0.07));

    const centerDifference = new THREE.Vector3()
      .crossVectors(this.pole1.direction, this.pole2.direction)
      .normalize()
      .multiplyScalar(0.14);

    const centerPole2Option1 = this.centerPole1.clone().add(centerDifference);
    const centerPole2Option2 = this.centerPole1.clone().sub(centerDifference);
    const distanceOption1 = position.distanceTo(centerPole2Option1);
    const distanceOption2 = position.distanceTo(centerPole2Option2);

    if (distanceOption1 < distanceOption2) {
      this.centerPole2 = centerPole2Option1;
    } else {
      this.centerPole2 = centerPole2Option2;
    }
  }

  commit() {
    this.pole1.addLashing(this);
    this.pole2.addLashing(this);
  }
}
