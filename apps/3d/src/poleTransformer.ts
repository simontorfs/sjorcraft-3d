import * as THREE from "three";
import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class PoleTransformer extends THREE.Object3D {
  viewer: Viewer;
  activePole: Pole | undefined = undefined;

  translationHandle: THREE.Mesh;
  scaleHandleTop: THREE.Mesh;
  scaleHandleBottom: THREE.Mesh;
  handles: THREE.Mesh[] = [];

  helperPlane: THREE.Plane = new THREE.Plane();

  constructor(viewer: Viewer) {
    super();
    this.viewer = viewer;
    const geometry = new THREE.CylinderGeometry(0.061, 0.061, 0.1);
    this.translationHandle = new THREE.Mesh(geometry, this.getHandleMaterial());
    this.scaleHandleTop = new THREE.Mesh(geometry, this.getHandleMaterial());
    this.scaleHandleBottom = new THREE.Mesh(geometry, this.getHandleMaterial());
    this.add(this.translationHandle);
    this.add(this.scaleHandleTop);
    this.add(this.scaleHandleBottom);
    this.visible = false;
    this.handles = [
      this.translationHandle,
      this.scaleHandleTop,
      this.scaleHandleBottom,
    ];
  }

  getHandleMaterial() {
    return new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.2,
    });
  }

  setActivePole(pole: Pole | undefined) {
    this.activePole = pole;
    if (pole) {
      this.visible = true;
      this.setHandlePositions();
      for (const handle of this.handles) {
        // @ts-ignore
        handle.material.color = pole.color;
      }
    } else {
      this.visible = false;
    }
  }

  setHandlePositions() {
    if (!this.activePole) return;
    const pole = this.activePole;
    this.position.set(pole.position.x, pole.position.y, pole.position.z);
    this.rotation.set(pole.rotation.x, pole.rotation.y, pole.rotation.z);
    this.scaleHandleTop.position.y = pole.length / 2 - 0.25;
    this.scaleHandleBottom.position.y = -pole.length / 2 + 0.25;
  }

  setHoveredHandle(hoveredHandle: THREE.Mesh | undefined) {
    for (const handle of this.handles) {
      if (handle === hoveredHandle) {
        // @ts-ignore
        handle.material.opacity = 0.5;
      } else {
        // @ts-ignore
        handle.material.opacity = 0.2;
      }
    }
  }

  dragTranslationHandle(dragPositionOnActivePole: THREE.Vector3) {
    if (!this.activePole) return;

    const start = this.activePole.position
      .clone()
      .sub(this.activePole.direction.clone().multiplyScalar(10));
    const end = this.activePole.position
      .clone()
      .add(this.activePole.direction.clone().multiplyScalar(10));
    const activePoleAxis = new THREE.Line3(start, end);

    let target: THREE.Vector3 = new THREE.Vector3();
    activePoleAxis.closestPointToPoint(dragPositionOnActivePole, true, target);

    this.activePole.position.set(target.x, target.y, target.z);
    this.setHandlePositions();
  }
}
