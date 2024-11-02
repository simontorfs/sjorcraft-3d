import { Pole } from "../objects/pole";
import { Viewer } from "../viewer";
import { PoleTransformer } from "./poleTransformer";
import * as THREE from "three";

export class TransformationTool {
  active: boolean;
  viewer: Viewer;
  hoveredPole: Pole | undefined;
  poleTransformer: PoleTransformer;
  activeHandle: THREE.Mesh | undefined;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = false;
    this.poleTransformer = new PoleTransformer(viewer);
    this.viewer.scene.add(this.poleTransformer);
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
    this.poleTransformer.setActivePole(undefined);
  }

  onMouseMove(cursor: THREE.Vector2, mouseDown: boolean) {
    if (mouseDown) {
      if (!this.activeHandle) return;
      this.poleTransformer.dragHandle(this.activeHandle);
    } else {
      this.hoveredPole = this.viewer.inputHandler.getHoveredPole();
      this.poleTransformer.setActivePole(this.hoveredPole);
      this.activeHandle = this.getHoveredHandle(cursor);
      this.poleTransformer.setHoveredHandle(this.activeHandle);
    }
  }

  drop() {
    if (this.activeHandle) this.poleTransformer.dropHandle(this.activeHandle);
  }

  getHoveredHandle(cursor: THREE.Vector2) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(cursor, this.viewer.camera);

    const intersect = raycaster.intersectObject(this.poleTransformer);
    if (intersect.length) {
      this.viewer.controls.enableRotate = false;
      return intersect[0].object as THREE.Mesh;
    } else {
      this.viewer.controls.enableRotate = true;
      return undefined;
    }
  }
}
