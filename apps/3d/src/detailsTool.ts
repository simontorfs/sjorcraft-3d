import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

interface IPolesDetail {
  length: number;
  number: number;
  color: string;
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
}
