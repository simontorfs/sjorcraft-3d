import * as THREE from "three";

export class TripodLashingCurve extends THREE.Curve<THREE.Vector3> {
  directionPole1: THREE.Vector3;
  directionPole2: THREE.Vector3;
  directionPole3: THREE.Vector3;
  vLM: THREE.Vector3;
  vRM: THREE.Vector3;

  dirNormal12: THREE.Vector3;
  dirNormal23: THREE.Vector3;
  dirPerp1: THREE.Vector3;
  dirPerp2: THREE.Vector3;
  dirPerp3: THREE.Vector3;

  constructor(
    directionPole1: THREE.Vector3,
    directionPole2: THREE.Vector3,
    directionPole3: THREE.Vector3,
    vLM: THREE.Vector3,
    vRM: THREE.Vector3
  ) {
    super();

    this.directionPole1 = directionPole1;
    this.directionPole2 = directionPole2;
    this.directionPole3 = directionPole3;

    this.vLM = vLM;
    this.vRM = vRM;

    this.dirNormal12 = new THREE.Vector3()
      .crossVectors(directionPole2, directionPole1)
      .normalize();

    // Directions perpendicular to both pole and the normal
    this.dirPerp1 = new THREE.Vector3()
      .crossVectors(this.directionPole1, this.dirNormal12)
      .normalize();
    this.dirPerp2 = new THREE.Vector3()
      .crossVectors(this.directionPole2, this.dirNormal12)
      .normalize();

    this.dirNormal23 = new THREE.Vector3()
      .crossVectors(this.directionPole2, this.directionPole3)
      .normalize();
    this.dirPerp3 = new THREE.Vector3()
      .crossVectors(this.directionPole3, this.dirNormal23)
      .normalize();
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const parts = 9;
    const rp1 = 0.06; // Radius pole1
    const rp2 = 0.06; // Radius pole2
    const ropeDiameter = 0.006;
    const spacing = ropeDiameter;
    let pole1Strand = false;

    const x = parts * t * 2 * Math.PI;
    const tx = Math.cos(x) * rp1;
    const ty = Math.sin(x) * rp1;
    const tz = 0;

    if (t < 1 / 3) {
      const v = new THREE.Vector3()
        .add(this.directionPole1.clone().multiplyScalar(tz))
        .add(this.dirNormal12.clone().multiplyScalar(tx))
        .add(this.dirPerp1.clone().multiplyScalar(ty))
        .sub(this.vLM);
      //.add(new THREE.Vector3(0, 0.3, 0));
      return optionalTarget.set(v.x, v.y, v.z);
    } else if (t < 2 / 3) {
      const v = new THREE.Vector3()
        .add(this.directionPole2.clone().multiplyScalar(tz))
        .add(this.dirNormal12.clone().multiplyScalar(tx))
        .add(this.dirPerp2.clone().multiplyScalar(ty));
      //.add(new THREE.Vector3(0, 0.3, 0));
      return optionalTarget.set(v.x, v.y, v.z);
    } else {
      const v = new THREE.Vector3()
        .add(this.directionPole3.clone().multiplyScalar(tz))
        .add(this.dirNormal23.clone().multiplyScalar(tx))
        .add(this.dirPerp3.clone().multiplyScalar(ty))
        .sub(this.vRM)
        .add(new THREE.Vector3(0, 0, 0));
      return optionalTarget.set(v.x, v.y, v.z);
    }
  }
}
