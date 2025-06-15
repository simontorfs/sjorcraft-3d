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

  mesh: THREE.Mesh = new THREE.Mesh();

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

    this.mesh.material = this.material;

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

    this.mesh.geometry.dispose();
    const path = new TripodLashingCurve(
      this.leftPole.direction,
      this.middlePole.direction,
      this.rightPole.direction,
      this.centerLeftPole.clone().sub(this.centerMiddlePole),
      this.centerRightPole.clone().sub(this.centerMiddlePole)
    );

    this.mesh.geometry = new THREE.TubeGeometry(path, 360, 0.003, 8, false);
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
