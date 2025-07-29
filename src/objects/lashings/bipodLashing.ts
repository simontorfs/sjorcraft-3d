import * as THREE from "three";
import { Pole } from "../pole";
import { BipodLashingCurve } from "./bipodLashingCurve";
import { Scaffold } from "../scaffold";
import { v4 as uuidv4 } from "uuid";
import { Lashing } from "./lashing";

export class BipodLashing extends Lashing {
  identifier: string;
  scaffold1: Scaffold;
  scaffold2: Scaffold;
  pole1: Pole;
  pole2: Pole;
  centerPole1: THREE.Vector3;
  centerPole2: THREE.Vector3;

  mesh: THREE.Mesh;
  constructor(scaffold1: Scaffold, scaffold2: Scaffold, identifier?: string) {
    super();
    this.identifier = identifier || uuidv4();
    this.scaffold1 = scaffold1;
    this.scaffold2 = scaffold2;

    this.mesh = new THREE.Mesh();
    this.mesh.material = this.material;
    this.add(this.mesh);

    this.update();
  }

  update() {
    if (this.scaffold1.length <= 6.0) this.pole1 = this.scaffold1.mainPole;
    else this.pole1 = this.scaffold1.extensionPole;
    if (this.scaffold2.length <= 6.0) this.pole2 = this.scaffold2.mainPole;
    else this.pole2 = this.scaffold2.extensionPole;

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
