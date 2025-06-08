import * as THREE from "three";

export class ScaffoldLashingCurve extends THREE.Curve<THREE.Vector3> {
  longitudalDirection: THREE.Vector3;
  radialDirection: THREE.Vector3;
  tangentialDirection: THREE.Vector3;
  vP1P2: THREE.Vector3;

  constructor(direction: THREE.Vector3, vP1P2: THREE.Vector3) {
    super();
    this.longitudalDirection = direction;
    this.vP1P2 = vP1P2;

    this.radialDirection = vP1P2.clone().normalize();
    this.tangentialDirection = new THREE.Vector3()
      .crossVectors(this.longitudalDirection, this.radialDirection)
      .normalize();
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const strandOffsets = [
      -4, -3, -2, -1, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, -1, -2, -3, -4,
    ];
    const parts = strandOffsets.length;
    const rp1 = 0.06; // Radius pole1
    const rp2 = 0.06; // Radius pole2
    const ropeDiameter = 0.006;
    const spacing = ropeDiameter;
    const pole1Strand = Math.ceil(t * parts) % 2 === 0;

    const x = parts * t * Math.PI;
    const tx = Math.cos(x);
    const ty = Math.sin(x);
    let tz =
      strandOffsets[Math.min(Math.floor(t * parts), parts - 1)] * spacing;

    if (pole1Strand) {
      const v = new THREE.Vector3()
        .add(this.longitudalDirection.clone().multiplyScalar(tz))
        .add(this.radialDirection.clone().multiplyScalar(ty * rp1))
        .add(this.tangentialDirection.clone().multiplyScalar(tx * rp1));
      return optionalTarget.set(v.x, v.y, v.z);
    } else {
      const v = new THREE.Vector3()
        .add(this.longitudalDirection.clone().multiplyScalar(tz))
        .add(this.radialDirection.clone().multiplyScalar(ty * rp2))
        .add(this.tangentialDirection.clone().multiplyScalar(tx * rp2))
        .add(this.vP1P2);
      return optionalTarget.set(v.x, v.y, v.z);
    }
  }
}
