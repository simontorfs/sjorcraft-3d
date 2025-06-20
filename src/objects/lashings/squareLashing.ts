import { Pole } from "../pole";
import { Scaffold } from "../scaffold";
import { Lashing } from "./lashing";
import { SquareLashingCurve } from "./squareLashingCurve";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

export class SquareLashing extends Lashing {
  identifier: string;
  fixedPole: Pole;
  loosePole: Pole;
  centerFixedPole: THREE.Vector3;
  centerLoosePole: THREE.Vector3;
  anchorPoint: THREE.Vector3; // Point on the surface of the fixed pole where the user clicked
  anchorPointNormal: THREE.Vector3;
  fixedHeight: number | undefined;

  mesh: THREE.Mesh = new THREE.Mesh();
  constructor(identifier?: string) {
    super();

    this.identifier = identifier || uuidv4();
  }

  setPropertiesFromAnchorPoint(
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

  setPropertiesFromTwoPoles(pole1: Pole, pole2: Pole) {
    this.fixedPole = pole1;
    this.loosePole = pole2;

    const { closestPoint, closestPointOnOtherPole } =
      this.fixedPole.getClosestApproach(this.loosePole);

    this.centerFixedPole = closestPoint;
    this.centerLoosePole = closestPointOnOtherPole;

    const pos = this.centerFixedPole
      .clone()
      .add(this.centerLoosePole)
      .divideScalar(2.0);
    this.position.set(pos.x, pos.y, pos.z);
    this.updateMesh();
  }

  loadFromJson(lashing: any, poles: Pole[]) {
    const fixedPole: Pole | undefined = poles.find(
      (pole) => pole.uuid === lashing.fixedPole
    );
    const loosePole: Pole | undefined = poles.find(
      (pole) => pole.uuid === lashing.loosePole
    );
    if (fixedPole && loosePole && lashing.position) {
      this.fixedPole = fixedPole;
      this.loosePole = loosePole;
      this.centerFixedPole = new THREE.Vector3(
        lashing.centerFixedPole.x,
        lashing.centerFixedPole.y,
        lashing.centerFixedPole.z
      );
      this.centerLoosePole = new THREE.Vector3(
        lashing.centerLoosePole.x,
        lashing.centerLoosePole.y,
        lashing.centerLoosePole.z
      );
      this.position.set(
        lashing.position.x,
        lashing.position.y,
        lashing.position.z
      );
      this.updateMesh();
      return true;
    }
    console.log("Dropping lashing");
    return false;
  }

  saveToJson() {
    return {
      fixedPole: this.fixedPole.uuid,
      loosePole: this.loosePole.uuid,
      position: this.position,
      centerFixedPole: this.centerFixedPole,
      centerLoosePole: this.centerLoosePole,
    };
  }

  calculatePositions() {
    this.centerFixedPole = this.anchorPoint
      .clone()
      .sub(
        this.anchorPointNormal.clone().multiplyScalar(this.fixedPole.radius)
      );

    const centerDifference = new THREE.Vector3()
      .crossVectors(this.fixedPole.direction, this.loosePole.direction)
      .normalize()
      .multiplyScalar(this.fixedPole.radius + this.loosePole.radius);

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
      this.snapLoosePole(this.fixedHeight);
    }

    const pos = this.centerLoosePole
      .clone()
      .add(this.centerFixedPole)
      .divideScalar(2.0);
    this.position.set(pos.x, pos.y, pos.z);
  }

  updateMesh() {
    this.remove(this.mesh);
    const path = new SquareLashingCurve(
      this.fixedPole.direction,
      this.centerFixedPole,
      this.loosePole.direction,
      this.centerLoosePole,
      this.position
    );
    const geometry = new THREE.TubeGeometry(path, 360, 0.003, 8, true);
    const material = new THREE.MeshStandardMaterial({
      color: 0x9e9578,
      wireframe: false,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);
  }

  snapLoosePole(desiredHeight: number) {
    // Move the center of the loose pole along the fixed pole direction until it is on the desired height.
    const heightDifference = this.centerLoosePole.y - desiredHeight;
    const translationDistance = heightDifference / this.fixedPole.direction.y;
    if (Math.abs(translationDistance) < 0.1 || this.fixedHeight) {
      const translationVector = this.fixedPole.direction
        .clone()
        .multiplyScalar(translationDistance);
      this.centerLoosePole.sub(translationVector);
      this.centerFixedPole.sub(translationVector);
      this.position.sub(translationVector);
      return true;
    }
    return false;
  }

  relashToRightScaffoldPole(scaffold: Scaffold) {
    if (scaffold.length < 6.0) return;
    const distanceToExtension = this.position.distanceTo(
      scaffold.extensionPole.position
    );
    const distanceToMain = this.position.distanceTo(scaffold.mainPole.position);
    if (distanceToExtension < distanceToMain) {
      if (this.loosePole === scaffold.mainPole) {
        this.loosePole = scaffold.extensionPole;
      } else if (this.fixedPole === scaffold.mainPole) {
        this.fixedPole = scaffold.extensionPole;
      } else {
        console.error(this.relashToRightScaffoldPole.name);
      }
    }
  }
}
