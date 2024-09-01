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
    const geometry = new THREE.TubeGeometry(path, 1200, 0.003, 8, true);
    const material = new THREE.MeshBasicMaterial({
      color: 0xc9bd97,
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
}

class SquareLashingCurve extends THREE.Curve<THREE.Vector3> {
  directionFixedPole: THREE.Vector3;
  directionLoosePole: THREE.Vector3;
  centerFixedPole: THREE.Vector3;
  centerLoosePole: THREE.Vector3;

  offsetFixedPole: THREE.Vector3;
  offsetLoosePole: THREE.Vector3;
  fixedPoleOnTop: Boolean; // The 'top' is arbitrary

  dirNormal: THREE.Vector3;
  dirPerpFixed: THREE.Vector3;
  dirPerpLoose: THREE.Vector3;

  constructor(
    directionFixedPole: THREE.Vector3,
    centerFixedPole: THREE.Vector3,
    directionLoosePole: THREE.Vector3,
    centerLoosePole: THREE.Vector3,
    position: THREE.Vector3
  ) {
    super();
    this.directionFixedPole = directionFixedPole;
    this.directionLoosePole = directionLoosePole;
    this.centerFixedPole = centerFixedPole.clone().sub(position); // Center in local coordinates
    this.centerLoosePole = centerLoosePole.clone().sub(position);

    this.dirNormal = new THREE.Vector3()
      .crossVectors(directionLoosePole, directionFixedPole)
      .normalize();

    const distanceLashingToFixedPole = this.centerFixedPole.length();

    const distanceTopPoleToFixedPole = this.dirNormal
      .clone()
      .multiplyScalar(0.06)
      .distanceTo(this.centerFixedPole);

    this.fixedPoleOnTop =
      distanceTopPoleToFixedPole < distanceLashingToFixedPole;

    // Directions perpendicular to both pole and the normal
    this.dirPerpFixed = new THREE.Vector3()
      .crossVectors(this.directionFixedPole, this.dirNormal)
      .normalize();

    this.dirPerpLoose = new THREE.Vector3()
      .crossVectors(this.directionLoosePole, this.dirNormal)
      .normalize();
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const parts = 12;
    const rfp = 0.06; // Radius fixed pole
    const rlp = 0.06; // Radius loose pole
    const ropeDiameter = 0.006;
    const spacing = ropeDiameter + 0.001;
    let fixedPoleStrand = false;

    let x = 0,
      tx = 0,
      ty = 0,
      tz = 0;

    if (t < 1 / parts) {
      fixedPoleStrand = true;
      // First part of the rope curve follows a half circle around the fixed pole
      x = parts * t * 2 * rfp - rfp; // Map t on a value between -pr1 and +pr1, the range of a half circle around the fixed pole
      tx = x; // x-coordinate of a point on a circle in the x-y plane
      ty = Math.sqrt(rfp * rfp - x * x); // y-coordinate of a point on a circle in the x-y plane
      tz = -rlp; // The z-coordinate is offset from the center of the lashing by the radius of the loose pole
    } else if (t < 2 / parts) {
      fixedPoleStrand = false;
      x = (parts * t - 1) * 2 * rlp - rlp;
      tx = -x;
      ty = Math.sqrt(rlp * rlp - x * x);
      tz = rfp;
    } else if (t < 3 / parts) {
      fixedPoleStrand = true;
      x = (parts * t - 2) * 2 * rfp - rfp;
      tx = -x;
      ty = Math.sqrt(rfp * rfp - x * x);
      tz = rlp;
    } else if (t < 4 / parts) {
      fixedPoleStrand = false;
      x = (parts * t - 3) * 2 * rlp - rlp;
      tx = x;
      ty = Math.sqrt(rlp * rlp - x * x);
      tz = -rfp;
    } else if (t < 5 / parts) {
      fixedPoleStrand = true;
      x = (parts * t - 4) * 2 * rfp - rfp;
      tx = x;
      ty = Math.sqrt(rfp * rfp - x * x);
      tz = -rlp - spacing;
    } else if (t < 6 / parts) {
      fixedPoleStrand = false;
      x = (parts * t - 5) * 2 * rlp - rlp;
      tx = -x;
      ty = Math.sqrt(rlp * rlp - x * x);
      tz = rfp - spacing;
    } else if (t < 7 / parts) {
      fixedPoleStrand = true;
      x = (parts * t - 6) * 2 * rfp - rfp;
      tx = -x;
      ty = Math.sqrt(rfp * rfp - x * x);
      tz = rlp + spacing;
    } else if (t < 8 / parts) {
      fixedPoleStrand = false;
      x = (parts * t - 7) * 2 * rlp - rlp;
      tx = x;
      ty = Math.sqrt(rlp * rlp - x * x);
      tz = -rfp + spacing;
    } else if (t < 9 / parts) {
      fixedPoleStrand = true;
      x = (parts * t - 8) * 2 * rfp - rfp;
      tx = x;
      ty = Math.sqrt(rfp * rfp - x * x);
      tz = -rlp - 2 * spacing;
    } else if (t < 10 / parts) {
      fixedPoleStrand = false;
      x = (parts * t - 9) * 2 * rlp - rlp;
      tx = -x;
      ty = Math.sqrt(rlp * rlp - x * x);
      tz = rfp - 2 * spacing;
    } else if (t < 11 / parts) {
      fixedPoleStrand = true;
      x = (parts * t - 10) * 2 * rfp - rfp;
      tx = -x;
      ty = Math.sqrt(rfp * rfp - x * x);
      tz = rlp + 2 * spacing;
    } else {
      fixedPoleStrand = false;
      x = (parts * t - 11) * 2 * rlp - rlp;
      tx = x;
      ty = Math.sqrt(rlp * rlp - x * x);
      tz = -rfp + 2 * spacing;
    }

    if (fixedPoleStrand) {
      const v = new THREE.Vector3()
        .add(this.directionFixedPole.clone().multiplyScalar(tz))
        .add(this.dirNormal.clone().multiplyScalar(ty))
        .add(this.dirPerpFixed.clone().multiplyScalar(tx))
        .multiplyScalar(this.fixedPoleOnTop ? 1 : -1)
        .add(this.centerFixedPole);
      return optionalTarget.set(v.x, v.y, v.z);
    } else {
      const v = new THREE.Vector3()
        .add(this.directionLoosePole.clone().multiplyScalar(tz))
        .sub(this.dirNormal.clone().multiplyScalar(ty))
        .add(this.dirPerpLoose.clone().multiplyScalar(tx))
        .multiplyScalar(this.fixedPoleOnTop ? 1 : -1)
        .add(this.centerLoosePole);
      return optionalTarget.set(v.x, v.y, v.z);
    }
  }
}
