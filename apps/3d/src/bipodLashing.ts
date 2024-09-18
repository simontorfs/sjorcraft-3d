import * as THREE from "three";
import { Pole } from "./pole";
import { BipodLashingCurve } from "./bipodLashingCurve";

export class BipodLashing extends THREE.Object3D {
  pole1: Pole;
  pole2: Pole;
  centerPole1: THREE.Vector3;
  centerPole2: THREE.Vector3;

  mesh: THREE.Mesh;
  constructor(pole1: Pole, pole2: Pole) {
    super();
    this.pole1 = pole1;
    this.pole2 = pole2;

    this.mesh = new THREE.Mesh();
    this.mesh.material = new THREE.MeshStandardMaterial({
      color: 0x9e9578,
      wireframe: false,
    });
    this.add(this.mesh);

    this.update();
  }

  update() {
    const { closestPoint, closestPointOnOtherPole } =
      this.pole1.getClosestApproach(this.pole2);

    this.centerPole1 = closestPoint ?? new THREE.Vector3();
    this.centerPole2 = closestPointOnOtherPole ?? new THREE.Vector3();

    this.position.set(
      this.centerPole1.x,
      this.centerPole1.y,
      this.centerPole1.z
    );

    const path = new BipodLashingCurve(
      this.pole1.direction,
      this.pole2.direction,
      this.centerPole1.clone().sub(this.centerPole2)
    );

    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.TubeGeometry(path, 360, 0.003, 8, true);
  }
}
