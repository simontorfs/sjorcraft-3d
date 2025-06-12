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

  mesh: THREE.Mesh;
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

    this.mesh = new THREE.Mesh();
    this.mesh.material = new THREE.MeshStandardMaterial({
      color: 0x9e9578,
      wireframe: false,
    });
    this.add(this.mesh);

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

    const {
      closestPoint: closestPointLeft,
      closestPointOnOtherPole: closestPointMiddleToLeft,
    } = this.leftPole.getClosestApproach(this.middlePole);

    const {
      closestPoint: closestPointRight,
      closestPointOnOtherPole: closestPointMiddleToRight,
    } = this.rightPole.getClosestApproach(this.middlePole);

    this.centerLeftPole = closestPointLeft ?? new THREE.Vector3();
    this.centerRightPole = closestPointRight ?? new THREE.Vector3();
    this.centerMiddlePole =
      closestPointMiddleToLeft && closestPointMiddleToRight
        ? closestPointMiddleToLeft
            .clone()
            .add(closestPointMiddleToRight)
            .divideScalar(2)
        : new THREE.Vector3();

    this.position.set(
      this.centerMiddlePole.x,
      this.centerMiddlePole.y,
      this.centerMiddlePole.z
    );

    const path = new TripodLashingCurve(
      this.leftPole.direction,
      this.middlePole.direction,
      this.rightPole.direction,
      this.centerMiddlePole.clone().sub(this.centerLeftPole),
      this.centerMiddlePole.clone().sub(this.centerRightPole)
    );

    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.TubeGeometry(path, 360, 0.003, 8, true);
    //this.mesh.geometry = new THREE.SphereGeometry(0.1);
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
