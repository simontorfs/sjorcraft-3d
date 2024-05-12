import * as THREE from "three";
import { Pole } from "./pole";

export class PoleTranformer extends THREE.Object3D {
  activePole: Pole | undefined = undefined;

  translationHandle: THREE.Mesh;
  scaleHandleTop: THREE.Mesh;
  scaleHandleBottom: THREE.Mesh;

  constructor() {
    super();
    const geometry = new THREE.CylinderGeometry(0.061, 0.061, 0.2);
    const material = new THREE.MeshStandardMaterial({
      color: "blue",
      wireframe: false,
      transparent: true,
      opacity: 0.5,
    });
    this.translationHandle = new THREE.Mesh(geometry, material);
    this.scaleHandleTop = new THREE.Mesh(geometry, material);
    this.scaleHandleBottom = new THREE.Mesh(geometry, material);
    this.add(this.translationHandle);
    this.add(this.scaleHandleTop);
    this.add(this.scaleHandleBottom);
    this.visible = false;

    this.translationHandle.addEventListener("mouseover", this.onMouseOver);
    this.translationHandle.addEventListener("mouseleave", this.onMouseLeave);
  }

  onMouseOver() {
    // @ts-ignore
    this.mesh.material.opacity = 0.85;
  }

  onMouseLeave() {
    // @ts-ignore
    this.mesh.material.opacity = 0.5;
  }
}
