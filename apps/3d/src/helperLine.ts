import * as THREE from "three";

export class HelperLine extends THREE.Line {
  constructor() {
    super();
    this.material = new THREE.LineDashedMaterial({
      color: 0x0000ff,
      dashSize: 0.05,
      gapSize: 0.05,
      depthTest: false,
    });
    this.renderOrder = 999;
  }

  setBetweenPoints(points: THREE.Vector3[]) {
    this.geometry.dispose();
    this.geometry = new THREE.BufferGeometry().setFromPoints(points);

    this.computeLineDistances();
  }
}
