import * as THREE from "three";
import { Pole } from "./pole";

export class Scaffold extends THREE.Object3D {
  mainPole: Pole;

  constructor() {
    super();
    this.mainPole = new Pole();
  }

  setDirection(direction: THREE.Vector3) {
    this.mainPole.setDirection(direction);
  }

  setPositionOnGround(position: THREE.Vector3) {
    this.mainPole.setPositionOnGround(position);
  }

  setPositionBetweenGroundAndPole(
    groundPoint: THREE.Vector3,
    polePoint: THREE.Vector3
  ) {
    this.mainPole.setPositionBetweenGroundAndPole(groundPoint, polePoint);
  }

  setPositionBetweenTwoPoles(pointA: THREE.Vector3, pointB: THREE.Vector3) {
    this.mainPole.setPositionBetweenTwoPoles(pointA, pointB);
  }

  setLength(minimumLength: number) {
    this.mainPole.setLength(minimumLength);
  }

  resize(resizeAtTop: boolean, newMinimumLength: number) {
    this.mainPole.resize(resizeAtTop, newMinimumLength);
  }

  isParallelTo(direction: THREE.Vector3) {
    this.mainPole.isParallelTo(direction);
  }

  isVertical() {
    return this.isParallelTo(new THREE.Vector3(0, 1, 0));
  }

  overlaps(otherPole: Pole) {
    return this.mainPole.overlaps(otherPole);
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.mainPole);
  }

  removeFromScene(scene: THREE.Scene) {
    scene.remove(this.mainPole);
  }
}
