import * as THREE from "three";

export class TripodLashingCurve extends THREE.Curve<THREE.Vector3> {
  directionLeftPole: THREE.Vector3;
  directionMiddlePole: THREE.Vector3;
  directionRightPole: THREE.Vector3;

  vML: THREE.Vector3;
  vMR: THREE.Vector3;

  normalLM: THREE.Vector3;
  normalRM: THREE.Vector3;

  perpendicularLeftPole: THREE.Vector3;
  perpendicularMiddlePole: THREE.Vector3;
  perpendicularRightPole: THREE.Vector3;

  angleBetweenWoelingenFromMiddlePoleCenter: number;

  constructor(
    directionLeftPole: THREE.Vector3,
    directionMiddlePole: THREE.Vector3,
    directionRightPole: THREE.Vector3,
    vML: THREE.Vector3,
    vMR: THREE.Vector3
  ) {
    super();

    this.directionLeftPole = directionLeftPole;
    this.directionMiddlePole = directionMiddlePole;
    this.directionRightPole = directionRightPole;

    this.vML = vML;
    this.vMR = vMR;

    this.normalLM = new THREE.Vector3()
      .crossVectors(this.directionLeftPole, this.directionMiddlePole)
      .normalize();
    if (!this.normalLM.length()) this.normalLM = vML.clone().normalize();

    this.normalRM = new THREE.Vector3()
      .crossVectors(this.directionRightPole, this.directionMiddlePole)
      .normalize();
    if (!this.normalRM.length()) this.normalRM = vMR.clone().normalize();

    this.perpendicularLeftPole = new THREE.Vector3().crossVectors(
      this.directionLeftPole,
      this.normalLM
    );

    this.perpendicularMiddlePole = new THREE.Vector3().crossVectors(
      this.directionMiddlePole,
      this.normalLM
    );

    this.perpendicularRightPole = new THREE.Vector3().crossVectors(
      this.directionRightPole,
      this.normalRM
    );

    const dot = this.vML.clone().normalize().dot(vMR.clone().normalize());
    const cross = new THREE.Vector3().crossVectors(
      this.normalLM,
      this.normalRM
    );
    this.angleBetweenWoelingenFromMiddlePoleCenter = Math.atan2(
      cross.length(),
      dot
    );
    if (this.directionMiddlePole.dot(cross) > 0) {
      this.angleBetweenWoelingenFromMiddlePoleCenter =
        2 * Math.PI - this.angleBetweenWoelingenFromMiddlePoleCenter;
    }
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    // Segment 1: Left pole
    // Segment 2: First part of middle pole
    // Segment 3: Right pole
    // Segment 4: Second part of middle pole
    const segments = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4];
    const zOffsets = [-1, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 1];
    const totalParts = segments.length;
    let currentPart = Math.floor(t * totalParts);
    if (currentPart >= totalParts) currentPart = 0;
    const currentSegment = segments[currentPart];
    const offset = zOffsets[currentPart];

    const poleRadius = 0.06;
    const ropeDiameter = 0.006;
    const spacing = ropeDiameter;

    const x =
      currentSegment === 1 || currentSegment === 3
        ? t * totalParts * 2 * Math.PI
        : currentSegment === 2
        ? ((t * totalParts) % 1) *
          this.angleBetweenWoelingenFromMiddlePoleCenter
        : ((t * totalParts) % 1) *
            (2 * Math.PI - this.angleBetweenWoelingenFromMiddlePoleCenter) +
          this.angleBetweenWoelingenFromMiddlePoleCenter;

    const tx = Math.cos(x) * poleRadius;
    const ty = Math.sin(x) * poleRadius;
    const tz = offset * spacing;

    if (currentSegment === 1) {
      const v = new THREE.Vector3()
        .add(this.directionLeftPole.clone().multiplyScalar(tz))
        .sub(this.normalLM.clone().multiplyScalar(tx))
        .add(this.perpendicularLeftPole.clone().multiplyScalar(ty))
        .add(this.vML);

      return optionalTarget.set(v.x, v.y, v.z);
    } else if (currentSegment === 2 || currentSegment === 4) {
      const v = new THREE.Vector3()
        .add(this.directionMiddlePole.clone().multiplyScalar(tz))
        .add(this.normalLM.clone().multiplyScalar(tx))
        .add(this.perpendicularMiddlePole.clone().multiplyScalar(ty));

      return optionalTarget.set(v.x, v.y, v.z);
    } else {
      // currentSegment === 3
      const v = new THREE.Vector3()
        .add(this.directionRightPole.clone().multiplyScalar(tz))
        .add(this.normalRM.clone().multiplyScalar(tx))
        .add(this.perpendicularRightPole.clone().multiplyScalar(ty))
        .add(this.vMR);

      return optionalTarget.set(v.x, v.y, v.z);
    }
  }
}
