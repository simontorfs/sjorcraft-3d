import * as THREE from "three";
import { Viewer } from "./viewer";

export class Floor extends THREE.Object3D {
  viewer: Viewer;
  mesh: THREE.Mesh;
  grid: THREE.GridHelper;
  constructor(viewer: Viewer) {
    super();
    this.viewer = viewer;
    this.setNewFloor(50, 50, new THREE.Color("#2a6e3c"));
  }
  /**
   * @description This method removes the grid from the scene
   */
  removeGrid() {
    this.viewer.scene.remove(this.grid);
  }
  /**
   *
   * @param length this is the length of the floor
   * @param width this is the width of the floor
   * @param color if provided, this is the color of the floor, default is green
   * @description This method sets the floor of the scene
   */
  setFloor(length: number, width: number, color?: THREE.Color) {
    const floorGeometry = new THREE.PlaneGeometry(length, width);
    const floorMaterial = new THREE.MeshBasicMaterial({
      opacity: 0.5,
      transparent: false,
      color: color ? color : "#2a6e3c",
    });
    this.mesh = new THREE.Mesh(floorGeometry, floorMaterial);
    this.mesh.rotation.x = -Math.PI / 2;
    this.viewer.scene.add(this.mesh);
  }
  /**
   *
   * @param size this is the size of the grid
   * @param divisions this is the number of divisions in the grid
   * @description This method sets the grid of the scene
   */
  setGrid(size: number, divisions: number) {
    this.grid = new THREE.GridHelper(size, divisions, 0x888888, 0x888888);
    this.grid.position.y = 0.01;
    this.grid.material.opacity = 0.35;
    this.grid.material.transparent = true;
    this.viewer.scene.add(this.grid);
  }

  /**
   *
   * @param length this is the length of the floor
   * @param width this is the width of the floor
   * @description This method updates the dimensions of the floor and grid
   */
  setDimensions(length: number, width: number) {
    this.mesh.geometry.dispose();
    (this.mesh.geometry = new THREE.PlaneGeometry(length, width)),
      this.removeGrid();
    const size = Math.max(length, width);
    this.setGrid(size, size);
  }

  /**
   *
   * @param length this is the length of the floor
   * @param width this is the width of the floor
   * @param color if provided, this is the color of the floor, default is green
   * @description This method sets a completly new floor and grid
   */
  setNewFloor(length: number, width: number, color?: THREE.Color) {
    this.viewer.scene.remove(this.mesh);
    this.viewer.scene.remove(this.grid);
    this.setFloor(length, width, color);
    const size = Math.max(length, width);
    this.setGrid(size, size);
  }
}
