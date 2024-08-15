import { Pole, colors, allowedLengths } from "./pole";
import { Viewer } from "./viewer";
import * as THREE from "three";

interface IPolesDetail {
  length: number;
  number: number;
  color: string;
}

export class PoleInventory {
  viewer: Viewer;
  poles: Pole[] = [];

  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  addPole(pole: Pole) {
    this.poles.push(pole);
    (this.viewer.scene as any).dispatchEvent({
      type: "new_pole_placed",
      value: { pole },
    });
  }

  removePole(poleToRemove: Pole) {
    this.viewer.scene.remove(poleToRemove);
    this.poles = this.poles.filter((pole) => pole !== poleToRemove);
    (this.viewer.scene as any).dispatchEvent({
      type: "pole_removed",
      value: { poleToRemove },
    });
  }

  removeAll() {
    for (const pole of this.poles) {
      this.viewer.scene.remove(pole);
    }
    this.poles = [];
  }

  getPolesGroupedByLength() {
    const poles: Pole[] = this.poles;
    const polesGroupedByLength: IPolesDetail[] = [];

    for (length of allowedLengths) {
      const number = poles.reduce((acc, pole) => {
        if (pole.length === length) {
          return acc + 1;
        } else {
          return acc;
        }
      }, 0);
      const index = allowedLengths.indexOf(length);
      polesGroupedByLength.push({
        length,
        number,
        color: `#${colors[index].getHexString()}`,
      });
    }
    return polesGroupedByLength;
  }

  resetAllColors() {
    for (const pole of this.poles) {
      //@ts-ignore
      pole.mesh.material.color = new THREE.Color(1, 1, 1);
    }
  }
}
