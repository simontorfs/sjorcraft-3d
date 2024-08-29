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
    const parts = 12;
    const rp1 = 0.06; // Radius pole 1
    const rp2 = 0.06; // Radius Pole 2
    const ropeDiameter = 0.004;
    const spacing = ropeDiameter + 0.001;
    if (t < 1 / parts) {
      // First part of the rope curve follows a half circle around pole1
      const r = parts * t * 2 * rp1 - rp1; // Map t on a value between -pr1 and +pr1, the range of a half circle around pole1
      const tx = r; // x-coordinate of a point on a circle in the x-y plane
      const ty = rp1 + Math.sqrt(rp1 * rp1 - r * r); // y-coordinate of a point on a circle in the x-y plane
      const tz = -rp2; // The z-coordinate is offset from the center of the lashing by the radius of pole2

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 2 / parts) {
      const r = (parts * t - 1) * 2 * rp2 - rp2;
      const tx = rp1;
      const ty = -rp2 - Math.sqrt(rp2 * rp2 - r * r);
      const tz = r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 3 / parts) {
      const r = (parts * t - 2) * 2 * rp1 - rp1;
      const tx = -r;
      const ty = rp1 + Math.sqrt(rp1 * rp1 - r * r);
      const tz = rp2;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 4 / parts) {
      const r = (parts * t - 3) * 2 * rp2 - rp2;
      const tx = -rp1;
      const ty = -rp2 - Math.sqrt(rp2 * rp2 - r * r);
      const tz = -r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 5 / parts) {
      const r = (parts * t - 4) * 2 * rp1 - rp1;
      const tx = r;
      const ty = rp1 + Math.sqrt(rp1 * rp1 - r * r);
      const tz = -rp2 - spacing;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 6 / parts) {
      const r = (parts * t - 5) * 2 * rp2 - rp2;
      const tx = rp1 - spacing;
      const ty = -rp2 - Math.sqrt(rp2 * rp2 - r * r);
      const tz = r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 7 / parts) {
      const r = (parts * t - 6) * 2 * rp1 - rp1;
      const tx = -r;
      const ty = rp1 + Math.sqrt(rp1 * rp1 - r * r);
      const tz = rp2 + spacing;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 8 / parts) {
      const r = (parts * t - 7) * 2 * rp2 - rp2;
      const tx = -rp1 + spacing;
      const ty = -rp2 - Math.sqrt(rp2 * rp2 - r * r);
      const tz = -r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 9 / parts) {
      const r = (parts * t - 8) * 2 * rp1 - rp1;
      const tx = r;
      const ty = rp1 + Math.sqrt(rp1 * rp1 - r * r);
      const tz = -rp2 - 2 * spacing;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 10 / parts) {
      const r = (parts * t - 9) * 2 * rp2 - rp2;
      const tx = rp1 - 2 * spacing;
      const ty = -rp2 - Math.sqrt(rp2 * rp2 - r * r);
      const tz = r;

      return optionalTarget.set(tx, ty, tz);
    } else if (t < 11 / parts) {
      const r = (parts * t - 10) * 2 * rp1 - rp1;
      const tx = -r;
      const ty = rp1 + Math.sqrt(rp1 * rp1 - r * r);
      const tz = rp2 + 2 * spacing;

      return optionalTarget.set(tx, ty, tz);
    } else {
      const r = (parts * t - 11) * 2 * rp2 - rp2;
      const tx = -rp1 + 2 * spacing;
      const ty = -rp2 - Math.sqrt(rp2 * rp2 - r * r);
      const tz = -r;

      return optionalTarget.set(tx, ty, tz);
    }
  }
}
