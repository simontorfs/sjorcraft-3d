import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

export class BipodTool {
  active: boolean;
  pole1: Pole;
  pole2: Pole;
  viewer: Viewer;
  constructor(viewer: Viewer) {
    this.active = false;
    this.viewer = viewer;
    this.pole1 = new Pole();
    this.pole2 = new Pole();
  }

  activate() {
    this.active = true;
    this.viewer.scene.add(this.pole1);
    this.viewer.scene.add(this.pole2);
  }

  deactivate() {
    this.active = false;
    this.viewer.scene.remove(this.pole1);
    this.viewer.scene.remove(this.pole2);
  }

  drawBipod(groundPosition: THREE.Vector3) {
    console.log(groundPosition);
    this.pole1.position.set(
      groundPosition.x,
      groundPosition.y + this.pole1.length / 2.0,
      groundPosition.z
    );
    this.pole2.position.set(
      groundPosition.x + 0.14,
      groundPosition.y + this.pole1.length / 2.0,
      groundPosition.z
    );
  }

  leftClick() {}
}
