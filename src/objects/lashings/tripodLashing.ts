import * as THREE from "three";
import { Scaffold } from "../scaffold";
import { v4 as uuidv4 } from "uuid";
import { Lashing } from "./lashing";
import { Pole } from "../pole";
import { TripodLashingCurve } from "./tripodLashingCurve";

export class TripodLashing extends Lashing {
  identifier: string;

  leftScaffold: Scaffold;
  middleScaffold: Scaffold;
  rightScaffold: Scaffold;

  leftPole: Pole;
  middlePole: Pole;
  rightPole: Pole;

  centerLeftPole: THREE.Vector3;
  centerMiddlePole: THREE.Vector3;
  centerRightPole: THREE.Vector3;

  meshes: THREE.Mesh[] = [
    // Timmermanssteek
    new THREE.Mesh(),
    // Left pole
    new THREE.Mesh(),
    new THREE.Mesh(),
    new THREE.Mesh(),
    // Middle pole
    new THREE.Mesh(),
    new THREE.Mesh(),
    new THREE.Mesh(),
    // Right pole
    new THREE.Mesh(),
    new THREE.Mesh(),
    new THREE.Mesh(),
    // Mastworp
    new THREE.Mesh(),
    new THREE.Mesh(),
  ];

  constructor(
    leftScaffold: Scaffold,
    middleScaffold: Scaffold,
    rightScaffold: Scaffold,
    identifier?: string
  ) {
    super();
    this.identifier = identifier || uuidv4();

    this.leftScaffold = leftScaffold;
    this.middleScaffold = middleScaffold;
    this.rightScaffold = rightScaffold;

    const meshMaterial = new THREE.MeshStandardMaterial({
      color: 0x9e9578,
      wireframe: false,
    });
    for (const mesh of this.meshes) {
      mesh.material = meshMaterial;
    }
    this.add(...this.meshes);

    this.update();
  }

  update() {
    if (this.leftScaffold.length <= 6.0)
      this.leftPole = this.leftScaffold.mainPole;
    else this.leftPole = this.leftScaffold.extensionPole;
    if (this.middleScaffold.length <= 6.0)
      this.middlePole = this.middleScaffold.mainPole;
    else this.middlePole = this.middleScaffold.extensionPole;
    if (this.rightScaffold.length <= 6.0)
      this.rightPole = this.rightScaffold.mainPole;
    else this.rightPole = this.rightScaffold.extensionPole;

    const { closestPointOnOtherPole: closestPointMiddleToLeft } =
      this.leftPole.getClosestApproach(this.middlePole);

    const { closestPointOnOtherPole: closestPointMiddleToRight } =
      this.rightPole.getClosestApproach(this.middlePole);

    if (
      this.leftPole.isParallelTo(this.middlePole.direction) &&
      this.rightPole.isParallelTo(this.middlePole.direction)
    ) {
      this.centerMiddlePole = this.middlePole.position
        .clone()
        .add(
          this.middlePole.direction
            .clone()
            .multiplyScalar(this.middlePole.length / 2 - 0.2)
        );
    } else if (this.rightPole.isParallelTo(this.middlePole.direction)) {
      this.centerMiddlePole = closestPointMiddleToLeft;
    } else {
      if (closestPointMiddleToLeft && closestPointMiddleToRight) {
        this.centerMiddlePole = new THREE.Vector3()
          .addVectors(closestPointMiddleToLeft, closestPointMiddleToRight)
          .divideScalar(2);
      } else {
        this.centerMiddlePole = this.middlePole.position.clone();
      }
    }

    this.centerLeftPole = this.leftPole.getProjectedPoint(
      this.centerMiddlePole
    );
    this.centerRightPole = this.rightPole.getProjectedPoint(
      this.centerMiddlePole
    );

    this.position.set(
      this.centerMiddlePole.x,
      this.centerMiddlePole.y,
      this.centerMiddlePole.z
    );

    for (let i = 0; i < this.meshes.length; i++) {
      const mesh = this.meshes[i];
      mesh.geometry.dispose();
      const path =
        i < 4
          ? new TripodLashingCurve(this.leftPole.direction, i - 2)
          : i < 7
          ? new TripodLashingCurve(this.middlePole.direction, i - 5)
          : new TripodLashingCurve(this.rightPole.direction, i - 8);
      mesh.geometry = new THREE.TubeGeometry(path, 36, 0.003, 8, true);
      const pos =
        i < 4
          ? this.centerLeftPole.clone().sub(this.centerMiddlePole)
          : i < 7
          ? new THREE.Vector3()
          : this.centerRightPole.clone().sub(this.centerMiddlePole);
      mesh.position.set(pos.x, pos.y, pos.z);
    }
  }

  threatenWithDestruction() {
    for (const mesh of this.meshes) {
      // @ts-ignore
      mesh.material.color = new THREE.Color(0x996209);
    }
  }

  stopThreatening() {
    for (const mesh of this.meshes) {
      // @ts-ignore
      mesh.material.color = new THREE.Color(0x9e9578);
    }
  }

  relashToRightScaffoldPole(scaffold: Scaffold) {
    if (scaffold.length < 6.0) return;
    const distanceToExtension = this.position.distanceTo(
      scaffold.extensionPole.position
    );
    const distanceToMain = this.position.distanceTo(scaffold.mainPole.position);
    if (distanceToExtension < distanceToMain) {
      if (this.leftPole === scaffold.mainPole) {
        this.leftPole = scaffold.extensionPole;
      } else if (this.middlePole === scaffold.mainPole) {
        this.middlePole = scaffold.extensionPole;
      } else if (this.rightPole === scaffold.mainPole) {
        this.rightPole = scaffold.extensionPole;
      } else {
        console.error(this.relashToRightScaffoldPole.name);
      }
    }
  }
}
