import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

interface IPolesDetail {
  name: string;
  length: number;
}
export class DetailsTool {
  viewer: Viewer;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }
  // return amount of poles and their length based on their direction
  getPoleDetails() {
    const polesDetails: IPolesDetail[] = this.viewer.poles.map((pole) => {
      return {
        name: pole.name,
        length: pole.geometry.parameters.height,
      };
    });
    // return list of amount of poles based on their length
    const polesLengths = polesDetails.reduce((acc, pole) => {
      if (acc[pole.length]) {
        acc[pole.length]++;
      } else {
        acc[pole.length] = 1;
      }
      return acc;
    }, {});
    console.log("Amount of poles by length: ", polesLengths);
    console.log("Poles: ", this.viewer.poles);
    console.log("Poles details: ", polesDetails);
  }

  // get amount of points where 2 or more poles touch eachother if multiple poles are in the same position it counts as 1 point
  getTouchingPoints() {
    const touchingPoints = this.viewer.poles.reduce((acc, pole, index) => {
      const touchingPoles = this.viewer.poles.filter((p, i) => {
        return i !== index && p.position.equals(pole.position);
      });
      if (touchingPoles.length > 0) {
        acc++;
      }
      return acc;
    }, 0);
    console.log("Touching points: ", touchingPoints);
  }
}
