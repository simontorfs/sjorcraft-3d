import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

interface IPolesDetail {
  [key: number]: number;
}
export class DetailsTool {
  viewer: Viewer;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.getPolesGroupedByLength();
  }
  //return amount of poles grouped by length
  getPolesGroupedByLength() {
    const poles: Pole[] = this.viewer.poles;
    const polesGroupedByLength: IPolesDetail = {};
    poles.forEach((pole) => {
      if (polesGroupedByLength[pole.length]) {
        polesGroupedByLength[pole.length]++;
      } else {
        polesGroupedByLength[pole.length] = 1;
      }
    });
    console.log("Poles grouped by length: ", polesGroupedByLength);
    return polesGroupedByLength;
  }
}
