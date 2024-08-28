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
    const geometry = new THREE.TubeGeometry(path, 40, 0.004, 8, true);
    const material = new THREE.MeshBasicMaterial({ color: 0xc9bd97 });
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

  place() {
    const path = new SquareLashingCurve(this.fixedPole, this.loosePole);
    const geometry = new THREE.TubeGeometry(path, 40, 0.004, 8, false);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
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
    if (t < 0.25) {
      const r = 4 * t * 0.12 - 0.06;
      const tx = r;
      const ty = 0.06 + 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = -0.06;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 0.5) {
      const r = 4 * (t - 0.25) * 0.12 - 0.06;
      const tx = 0.06;
      const ty = -0.06 - 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 0.75) {
      const r = 4 * (t - 0.5) * 0.12 - 0.06;
      const tx = -r;
      const ty = 0.06 + 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = 0.06;

      return optionalTarget.set(tx, ty, tz);
    } else {
      const r = 4 * (t - 0.75) * 0.12 - 0.06;
      const tx = -0.06;
      const ty = -0.06 - 0.5 * Math.sqrt(0.12 * 0.12 - 4 * r * r);
      const tz = -r;

      return optionalTarget.set(tx, ty, tz);
    }
  }
}
