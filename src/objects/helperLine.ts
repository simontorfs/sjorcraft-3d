import * as THREE from "three";
import { TextSprite } from "./textsprite";

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

export class DistanceHelperLine extends HelperLine {
  label: TextSprite;
  constructor() {
    super();
    this.label = new TextSprite("");
    this.label.fontsize = 16;
    this.add(this.label);
  }

  setBetweenPoints(points: THREE.Vector3[]) {
    super.setBetweenPoints(points);

    const length = points[0].clone().sub(points[1]).length();
    this.label.setText(`${length.toFixed(2)} ${"m"}`);
    const pos = points[0].clone().add(points[1]).divideScalar(2.0);
    this.label.position.set(pos.x, pos.y, pos.z);
  }
}
