import * as THREE from "three";

export class PoleTransformer extends THREE.Object3D {
  translationHandleTop: THREE.Mesh;
  translationHandleBottom: THREE.Mesh;

  constructor() {
    super();
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
    const material = new THREE.MeshStandardMaterial({
      color: "blue",
      wireframe: false,
      visible: false,
    });
    this.translationHandleTop = new THREE.Mesh(geometry, material);
    this.translationHandleBottom = new THREE.Mesh(geometry, material);
    this.add(this.translationHandleTop);
    this.add(this.translationHandleBottom);
  }

  setLength(length: number) {
    this.translationHandleTop.position.y = length / 2 + 0.15;
    this.translationHandleBottom.position.y = -length / 2 - 0.15;
  }
}
