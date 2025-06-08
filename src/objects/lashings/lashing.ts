import * as THREE from "three";
import { Scaffold } from "../scaffold";

export class Lashing extends THREE.Object3D {
  constructor() {
    super();
  }

  threatenWithDestruction() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(0x996209);
  }

  stopThreatening() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(0x9e9578);
  }

  relashToRightScaffoldPole(scaffold: Scaffold) {
    // Virtual method to be overridden by subclasses
  }
}
