import { Pole } from "./pole";
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

  getPolesGroupedByLength() {
    const poles: Pole[] = this.poles;
    const polesGroupedByLength: IPolesDetail[] = [];
    const allowedLengths: number[] = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0];
    const colors: THREE.Color[] = [
      new THREE.Color(0xffa500),
      new THREE.Color(0x00ff00),
      new THREE.Color(0xff0000),
      new THREE.Color(0x037c6e),
      new THREE.Color(0xffffff),
      new THREE.Color(0x0000ff),
      new THREE.Color(0xffff00),
      new THREE.Color(0x000000),
    ];
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

  removeAll() {
    for (const pole of this.poles) {
      this.viewer.scene.remove(pole);
    }
    this.poles = [];
  }

  removePole(poleToRemove: Pole) {
    this.viewer.scene.remove(poleToRemove);
    this.poles = this.poles.filter((pole) => pole !== poleToRemove);
  }
}
