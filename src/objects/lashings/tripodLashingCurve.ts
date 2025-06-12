import * as THREE from "three";

export class TripodLashingCurve extends THREE.Curve<THREE.Vector3> {
  poleDirection: THREE.Vector3;
  zOffset: number;

  normal1: THREE.Vector3;
  normal2: THREE.Vector3;

  constructor(poleDirection: THREE.Vector3, zOffset: number) {
    super();

    this.poleDirection = poleDirection;
    this.zOffset = zOffset;

    this.normal1 = new THREE.Vector3()
      .crossVectors(this.poleDirection, new THREE.Vector3(0, 1, 0))
      .normalize();

    if (!this.normal1.length()) this.normal1 = new THREE.Vector3(1, 0, 0);

    this.normal2 = new THREE.Vector3()
      .crossVectors(this.poleDirection, this.normal1)
      .normalize();
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const poleRadius = 0.06;
    const ropeDiameter = 0.006;
    const spacing = ropeDiameter;

    const x = t * 2 * Math.PI;
    const tx = Math.cos(x) * poleRadius;
    const ty = Math.sin(x) * poleRadius;
    const tz = this.zOffset * spacing;

    const v = new THREE.Vector3()
      .add(this.poleDirection.clone().multiplyScalar(tz))
      .add(this.normal1.clone().multiplyScalar(tx))
      .add(this.normal2.clone().multiplyScalar(ty));
    return optionalTarget.set(v.x, v.y, v.z);
  }
}
