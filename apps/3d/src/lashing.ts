import { Pole } from "./pole";
import * as THREE from "three";

export class Lashing extends THREE.Object3D {
  fixedPole: Pole;
  loosePole: Pole;
  centerFixedPole: THREE.Vector3;
  centerLoosePole: THREE.Vector3;
  anchorPoint: THREE.Vector3; // Point on the surface of the fixed pole where the user clicked
  anchorPointNormal: THREE.Vector3;
  fixedHeight: number | undefined;

  mesh: THREE.Mesh = new THREE.Mesh();
  constructor() {
    super();
  }

  setProperties(
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

    this.remove(this.mesh);
    const path = new SquareLashingCurve(this.fixedPole, this.loosePole);
    const geometry = new THREE.TubeGeometry(path, 120, 0.002, 8, true);
    const material = new THREE.MeshBasicMaterial({
      color: 0xc9bd97,
      wireframe: true,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.position.set(
      this.anchorPoint.x,
      this.anchorPoint.y,
      this.anchorPoint.z
    );
    this.add(this.mesh);
  }

  loadFromJson(lashing: any, poles: Pole[]) {
    const fixedPole: Pole | undefined = poles.find(
      (pole) => pole.uuid === lashing.fixedPole
    );
    const loosePole: Pole | undefined = poles.find(
      (pole) => pole.uuid === lashing.loosePole
    );
    if (fixedPole && loosePole) {
      this.setProperties(
        fixedPole,
        loosePole,
        new THREE.Vector3(
          lashing.anchorPoint.x,
          lashing.anchorPoint.y,
          lashing.anchorPoint.z
        ),
        new THREE.Vector3(
          lashing.anchorPointNormal.x,
          lashing.anchorPointNormal.y,
          lashing.anchorPointNormal.z
        )
      );
      return true;
    }
    console.log("Dropping lashing, no valid poles; check order of loading");
    return false;
  }

  saveToJson() {
    return {
      fixedPole: this.fixedPole.uuid,
      loosePole: this.loosePole.uuid,
      anchorPoint: this.anchorPoint,
      anchorPointNormal: this.anchorPointNormal,
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
      return true;
    }
    return false;
  }
}

class SquareLashingCurve extends THREE.Curve<THREE.Vector3> {
  fixedPole: Pole;
  loosePole: Pole;
  constructor(fixedPole: Pole, loosePole: Pole) {
    super();
    this.fixedPole = fixedPole;
    this.loosePole = loosePole;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const p = 12;
    if (t < 1 / p) {
      const r = p * t * 0.12 - 0.06;
      const tx = r;
      const ty = 0.06 + 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = -0.06;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 2 / p) {
      const r = (p * t - 1) * 0.12 - 0.06;
      const tx = 0.06;
      const ty = -0.06 - 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 3 / p) {
      const r = (p * t - 2) * 0.12 - 0.06;
      const tx = -r;
      const ty = 0.06 + 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = 0.06;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 4 / p) {
      const r = (p * t - 3) * 0.12 - 0.06;
      const tx = -0.06;
      const ty = -0.06 - 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = -r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 5 / p) {
      const r = (p * t - 4) * 0.12 - 0.06;
      const tx = r;
      const ty = 0.06 + 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = -0.06 - 0.005;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 6 / p) {
      const r = (p * t - 5) * 0.12 - 0.06;
      const tx = 0.06 - 0.005;
      const ty = -0.06 - 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 7 / p) {
      const r = (p * t - 6) * 0.12 - 0.06;
      const tx = -r;
      const ty = 0.06 + 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = 0.06 + 0.005;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 8 / p) {
      const r = (p * t - 7) * 0.12 - 0.06;
      const tx = -0.06 + 0.005;
      const ty = -0.06 - 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = -r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 9 / p) {
      const r = (p * t - 8) * 0.12 - 0.06;
      const tx = r;
      const ty = 0.06 + 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = -0.06 - 0.01;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 10 / p) {
      const r = (p * t - 9) * 0.12 - 0.06;
      const tx = 0.06 - 0.01;
      const ty = -0.06 - 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 11 / p) {
      const r = (p * t - 10) * 0.12 - 0.06;
      const tx = -r;
      const ty = 0.06 + 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = 0.06 + 0.01;

      return optionalTarget.set(tx, ty, tz);
    } else {
      const r = (p * t - 11) * 0.12 - 0.06;
      const tx = -0.06 + 0.01;
      const ty = -0.06 - 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = -r;

      return optionalTarget.set(tx, ty, tz);
    }
  }
}
