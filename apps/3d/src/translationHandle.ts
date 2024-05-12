import * as THREE from "three";

export class TranslationHandle extends THREE.Object3D {
  mesh: THREE.Mesh;

  constructor() {
    super();
    const geometry = new THREE.CylinderGeometry(0.061, 0.061, 0.2);
    const material = new THREE.MeshStandardMaterial({
      color: "blue",
      wireframe: false,
      transparent: true,
      opacity: 0.5,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);
    this.visible = false;
  }

  makeVisible() {
    this.visible = true;
  }

  makeInvisible() {
    this.visible = false;
  }

  setColor(color: THREE.Color) {
    // @ts-ignore
    this.mesh.material.color = color;
  }
}
