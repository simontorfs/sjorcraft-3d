import * as THREE from "three";
import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class TripodTool {
  active: boolean = false;
  viewer: Viewer;

  pole1: Pole = new Pole();
  pole2: Pole = new Pole();
  pole3: Pole = new Pole();

  pole1Placed: boolean = false;
  pole2Placed: boolean = false;
  pole3Placed: boolean = false;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  activate() {}

  deactivate() {}

  leftClick() {}

  rightClick() {}

  drawTripod(groundPosition: THREE.Vector3) {}
}
