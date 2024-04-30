import * as THREE from "three";
import { Viewer } from "./viewer";

export class CustomizeTool {
  viewer: Viewer;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }
  removeFloor() {
    const floor = this.viewer.scene.children.find(
      (child) => child === this.viewer.floor
    );
    if (floor) {
      this.viewer.scene.remove(floor);
    }
  }

  removeGrid() {
    const grid = this.viewer.scene.children.find(
      (child) => child instanceof THREE.GridHelper
    );
    if (grid) {
      this.viewer.scene.remove(grid);
    }
  }
  setFloor(length: number, width: number) {
    this.removeFloor();
    const geometry = new THREE.PlaneGeometry(length, width);
    const material = this.viewer.floor.material as THREE.MeshBasicMaterial;
    this.viewer.floor = new THREE.Mesh(geometry, material);
    this.viewer.floor.rotation.x = -Math.PI / 2;
    this.viewer.scene.add(this.viewer.floor);
  }

  setGrid(length: number, width: number) {
    this.removeGrid();
    const size = Math.max(length, width);
    const grid = new THREE.GridHelper(size, size, 0x888888, 0x888888);
    grid.position.y = 0.01;
    grid.material.opacity = 0.65;
    grid.material.transparent = true;
    this.viewer.scene.add(grid);
  }
}
