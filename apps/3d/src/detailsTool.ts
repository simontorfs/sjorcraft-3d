import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

interface IPolesDetail {
  length: number;
  number: number;
  color: THREE.Color;
}
export class DetailsTool {
  viewer: Viewer;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }
  getPolesGroupedByLength() {
    const poles: Pole[] = this.viewer.poles;
    const polesGroupedByLength: IPolesDetail[] = [];
    const allowedLengths: number[] = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0];
    for (length of allowedLengths) {
      const number = poles.reduce((acc, pole) => {
        if (pole.length === length) {
          return acc + 1;
        } else {
          return acc;
        }
      }, 0);
      polesGroupedByLength.push({
        length,
        number,
        color: new THREE.Color(1, 1, 0),
      });
    }
    return polesGroupedByLength;
  }
}
