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
  labels: TextSprite[] = [];
  constructor() {
    super();
  }

  setBetweenPoints(points: THREE.Vector3[]) {
    super.setBetweenPoints(points);

    this.setNumberOfLabels(points.length - 1);

    for (let i = 0; i < points.length - 1; i++) {
      const length = points[i]
        .clone()
        .sub(points[i + 1])
        .length();
      this.labels[i].setText(`${length.toFixed(2)} ${"m"}`);
      const pos = points[i]
        .clone()
        .add(points[i + 1])
        .divideScalar(2.0);
      this.labels[i].position.set(pos.x, pos.y, pos.z);
    }
  }

  setNumberOfLabels(nr: number) {
    if (nr !== this.labels.length) {
      this.labels.forEach((label) => this.remove(label));
      this.labels = [];
      for (let i = 0; i < nr; i++) {
        const label = new TextSprite("");
        label.fontsize = 16;
        this.add(label);
        this.labels.push(label);
      }
    }
  }
}
