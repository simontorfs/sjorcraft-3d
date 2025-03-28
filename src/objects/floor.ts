import * as THREE from "three";
import { Viewer } from "./../viewer";

export class Floor extends THREE.Object3D {
  viewer: Viewer;
  mesh: THREE.Mesh;
  grid: THREE.GridHelper;
  constructor(viewer: Viewer) {
    super();
    this.viewer = viewer;
    this.setNewFloor(50, 50, new THREE.Color("#2a6e3c"), false);
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
   * @param texture if provided, this is the texture of the floor, default is false
   * @description This method sets the floor of the scene
   */
  setFloor(
    length: number,
    width: number,
    color?: THREE.Color,
    texture?: boolean
  ) {
    const floorGeometry = new THREE.PlaneGeometry(length, width);
    const textureLoader = new THREE.TextureLoader();
    const colorTexture = textureLoader.load(
      "../../textures/grass/grass1-albedo3.png"
    );
    colorTexture.repeat.y = width;
    colorTexture.repeat.x = length;
    colorTexture.wrapT = THREE.RepeatWrapping;
    colorTexture.wrapS = THREE.RepeatWrapping;

    const floorMaterial = new THREE.MeshBasicMaterial({
      map: texture ? colorTexture : null,
      wireframe: false,
      color: color ? color : "#2a6e3c",
      transparent: false,
    });
    this.mesh = new THREE.Mesh(floorGeometry, floorMaterial);
    this.mesh.name = "floor";
    this.mesh.rotation.x = -Math.PI / 2;
    this.viewer.scene.add(this.mesh);
  }

  /**
   *
   * @param size this is the size of the grid
   * @param divisions this is the number of divisions in the grid
   * @description This method sets the grid of the scene
   */
  setGrid(size: number, divisions: number, texture?: boolean) {
    this.grid = new THREE.GridHelper(
      size,
      divisions,
      texture ? new THREE.Color() : new THREE.Color("#888888"),
      texture ? new THREE.Color() : new THREE.Color("#888888")
    );
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
   * @param texture if provided, this is the texture of the floor, default is false
   * @description This method sets a completly new floor and grid
   */
  setNewFloor(
    length: number,
    width: number,
    color?: THREE.Color,
    texture?: boolean
  ) {
    this.viewer.scene.remove(this.mesh);
    this.viewer.scene.remove(this.grid);
    this.setFloor(length, width, color, texture);
    const size = Math.max(length, width);
    this.setGrid(size, size, texture);
  }

  onUpdateFromClient(texture?: boolean, color?: THREE.Color) {
    this.setNewFloor(50, 50, color, texture);
  }
}
