import * as THREE from "three";
import { Pole } from "../pole";
import { Scaffold } from "../scaffold";
import { v4 as uuidv4 } from "uuid";
import { ScaffoldLashingCurve } from "./scaffoldLashingCurve";
import { Lashing } from "./lashing";

export class ScaffoldLashing extends Lashing {
  identifier: string;
  pole1: Pole;
  pole2: Pole;
  centerPole1: THREE.Vector3;
  centerPole2: THREE.Vector3;
  offset: number;

  mesh: THREE.Mesh;
  constructor(pole1: Pole, pole2: Pole, offset: number, identifier?: string) {
    super();
    this.identifier = identifier || uuidv4();
    this.offset = offset;
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

  setOffset(offset: number) {
    this.offset = offset;
    this.update();
  }

  update() {
    this.centerPole1 = this.pole1.position
      .clone()
      .add(this.pole1.direction.clone().multiplyScalar(this.offset));
    const perpendicularVector = new THREE.Vector3().crossVectors(
      this.pole1.direction,
      this.pole1.position.clone().sub(this.pole2.position)
    );
    const connectingVector = new THREE.Vector3()
      .crossVectors(perpendicularVector, this.pole1.direction)
      .normalize();
    this.centerPole2 = this.centerPole1
      .clone()
      .add(
        connectingVector
          .clone()
          .multiplyScalar(this.pole1.radius + this.pole2.radius)
      );
    this.position.set(
      this.centerPole1.x,
      this.centerPole1.y,
      this.centerPole1.z
    );

    const path = new ScaffoldLashingCurve(
      this.pole1.direction,
      this.centerPole1.clone().sub(this.centerPole2)
    );
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.TubeGeometry(path, 360, 0.003, 8, true);
  }

  relashToRightScaffoldPole(scaffold: Scaffold) {
    if (scaffold.length < 6.0) return;
    const distanceToExtension = this.position.distanceTo(
      scaffold.extensionPole.position
    );
    const distanceToMain = this.position.distanceTo(scaffold.mainPole.position);
    if (distanceToExtension < distanceToMain) {
      if (this.pole1 === scaffold.mainPole) {
        this.pole1 = scaffold.extensionPole;
      } else if (this.pole2 === scaffold.mainPole) {
        this.pole2 = scaffold.extensionPole;
      } else {
        console.error(this.relashToRightScaffoldPole.name);
      }
    }
  }
}
