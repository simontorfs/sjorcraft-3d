import * as THREE from "three";
import { TextSprite } from "./textsprite";
import { Pole } from "./pole";
import { SquareLashing } from "./lashings/squareLashing";

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

export class AngleLabel extends TextSprite {
  constructor() {
    super("");
    this.fontsize = 16;
  }

  setOnPole(pole: Pole) {
    const angle = Math.abs(
      90 - (pole.direction.angleTo(new THREE.Vector3(0, 1, 0)) * 180) / Math.PI
    );

    this.setText(`${angle.toFixed(2)} ${"°"}`);
    const pos = pole.position;
    this.position.set(pos.x, pos.y, pos.z);
  }
}

export class AngleMarker extends THREE.Line {
  label: TextSprite = new TextSprite("");
  constructor() {
    super();
    this.label.fontsize = 16;
    this.add(this.label);

    this.material = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      depthTest: false,
    });
    this.renderOrder = 999;
  }

  setOnLashing(lashing: SquareLashing) {
    const dir1 = lashing.fixedPole.direction;
    const dir2 = lashing.loosePole.direction;
    this.setBetweenPoles(dir1, dir2, lashing.position);
  }

  setBetweenPoles(
    dir1: THREE.Vector3,
    dir2: THREE.Vector3,
    pos: THREE.Vector3
  ) {
    const p1 = dir1.clone().multiplyScalar(0.3).add(pos);
    const p2 = dir2.clone().multiplyScalar(0.3).add(pos);

    let angle = (dir1.angleTo(dir2) / Math.PI) * 180;
    if (angle > 90) {
      dir2.negate();
      angle = (dir1.angleTo(dir2) / Math.PI) * 180;
      p2.add(dir2.clone().multiplyScalar(0.6));
    }
    const labelPos = dir1.clone().add(dir2).normalize().multiplyScalar(0.3);
    labelPos.add(pos);
    this.label.setText(`${angle.toFixed(2)} ${"°"}`);
    this.label.position.set(labelPos.x, labelPos.y, labelPos.z);

    this.geometry.dispose();
    this.geometry = new THREE.BufferGeometry().setFromPoints([p1, pos, p2]);

    this.computeLineDistances();
  }
}
