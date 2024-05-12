import * as THREE from "three";
import { Pole } from "./pole";

export class PoleTransformer extends THREE.Object3D {
  activePole: Pole | undefined = undefined;

  translationHandle: THREE.Mesh;
  scaleHandleTop: THREE.Mesh;
  scaleHandleBottom: THREE.Mesh;

  constructor() {
    super();
    const geometry = new THREE.CylinderGeometry(0.061, 0.061, 0.1);
    const material = new THREE.MeshStandardMaterial({
      color: "purple",
      transparent: true,
      opacity: 0.2,
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
    this.scaleHandleTop.addEventListener("mouseover", this.onMouseOver);
    this.scaleHandleTop.addEventListener("mouseleave", this.onMouseLeave);
    this.scaleHandleBottom.addEventListener("mouseover", this.onMouseOver);
    this.scaleHandleBottom.addEventListener("mouseleave", this.onMouseLeave);
  }

  onMouseOver() {
    // @ts-ignore
    this.mesh.material.opacity = 0.85;
  }

  onMouseLeave() {
    // @ts-ignore
    this.mesh.material.opacity = 0.5;
  }

  setActivePole(pole: Pole | undefined) {
    this.activePole = pole;
    if (pole) {
      this.visible = true;
      this.position.set(pole.position.x, pole.position.y, pole.position.z);
      this.rotation.set(pole.rotation.x, pole.rotation.y, pole.rotation.z);
      this.scaleHandleTop.position.y = pole.length / 2 - 0.25;
      this.scaleHandleBottom.position.y = -pole.length / 2 + 0.25;
      // @ts-ignore
      this.translationHandle.material.color = pole.color;
    } else {
      this.visible = false;
    }
  }
}
