import * as THREE from "three";

export class BipodLashingCurve extends THREE.Curve<THREE.Vector3> {
  directionPole1: THREE.Vector3;
  directionPole2: THREE.Vector3;
  vP1P2: THREE.Vector3;

  dirNormal: THREE.Vector3;
  dirPerp1: THREE.Vector3;
  dirPerp2: THREE.Vector3;

  constructor(
    directionPole1: THREE.Vector3,
    directionPole2: THREE.Vector3,
    vP1P2: THREE.Vector3
  ) {
    super();
    this.directionPole1 = directionPole1;
    this.directionPole2 = directionPole2;
    this.vP1P2 = vP1P2;

    this.dirNormal = new THREE.Vector3()
      .crossVectors(directionPole2, directionPole1)
      .normalize();

    // Directions perpendicular to both pole and the normal
    this.dirPerp1 = new THREE.Vector3()
      .crossVectors(this.directionPole1, this.dirNormal)
      .normalize();

    this.dirPerp2 = new THREE.Vector3()
      .crossVectors(this.directionPole2, this.dirNormal)
      .normalize();
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const parts = 9;
    const rp1 = 0.06; // Radius pole1
    const rp2 = 0.06; // Radius pole2
    const ropeDiameter = 0.006;
    const spacing = ropeDiameter;
    let pole1Strand = false;

    let x = 0,
      tx = 0,
      ty = 0,
      tz = 0;

    if (t < 1 / parts) {
      // Timmermanssteek
      pole1Strand = true;
      x = parts * t * 2 * Math.PI;
      tx = Math.cos(x) * rp1;
      ty = Math.sin(x) * rp1;
      tz = -2 * spacing;
    } else if (t < 2 / parts) {
      pole1Strand = true;
      x = parts * t * 2 * Math.PI;
      tx = Math.cos(x) * rp1;
      ty = Math.sin(x) * rp1;
      tz = -spacing;
    } else if (t < 3 / parts) {
      pole1Strand = false;
      x = (parts * t - 1) * 2 * Math.PI;
      tx = Math.cos(x) * rp2;
      ty = Math.sin(x) * rp2;
      tz = -spacing;
    } else if (t < 4 / parts) {
      pole1Strand = true;
      x = (parts * t - 2) * 2 * Math.PI;
      tx = Math.cos(x) * rp1;
      ty = Math.sin(x) * rp1;
      tz = 0;
    } else if (t < 5 / parts) {
      pole1Strand = false;
      x = (parts * t - 3) * 2 * Math.PI;
      tx = Math.cos(x) * rp2;
      ty = Math.sin(x) * rp2;
      tz = 0;
    } else if (t < 6 / parts) {
      pole1Strand = true;
      x = (parts * t - 4) * 2 * Math.PI;
      tx = Math.cos(x) * rp1;
      ty = Math.sin(x) * rp1;
      tz = spacing;
    } else if (t < 7 / parts) {
      pole1Strand = false;
      x = (parts * t - 5) * 2 * Math.PI;
      tx = Math.cos(x) * rp2;
      ty = Math.sin(x) * rp2;
      tz = spacing;
    } else if (t < 8 / parts) {
      // Mastworp
      pole1Strand = false;
      x = (parts * t - 5) * 2 * Math.PI;
      tx = Math.cos(x) * rp2;
      ty = Math.sin(x) * rp2;
      tz = 2 * spacing;
    } else {
      // Mastworp
      pole1Strand = false;
      x = (parts * t - 5) * 2 * Math.PI;
      tx = Math.cos(x) * rp2;
      ty = Math.sin(x) * rp2;
      tz = 3 * spacing;
    }

    if (pole1Strand) {
      const v = new THREE.Vector3()
        .add(this.directionPole1.clone().multiplyScalar(tz))
        .add(this.dirNormal.clone().multiplyScalar(tx))
        .add(this.dirPerp1.clone().multiplyScalar(ty));
      return optionalTarget.set(v.x, v.y, v.z);
    } else {
      const v = new THREE.Vector3()
        .add(this.directionPole2.clone().multiplyScalar(tz))
        .sub(this.dirNormal.clone().multiplyScalar(tx))
        .add(this.dirPerp2.clone().multiplyScalar(ty))
        .sub(this.vP1P2);
      return optionalTarget.set(v.x, v.y, v.z);
    }
  }
}
