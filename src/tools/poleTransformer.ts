import * as THREE from "three";
import { Pole } from "../objects/pole";
import { Viewer } from "../viewer";
import { Scaffold } from "../objects/scaffold";
import { Lashing } from "../objects/lashings/lashing";

export class PoleTransformer extends THREE.Object3D {
  viewer: Viewer;
  activeScaffold: Scaffold | undefined = undefined;
  originalPosition: THREE.Vector3 = new THREE.Vector3();
  lashingsOnActiveScaffold: Lashing[] = [];

  translationHandle: THREE.Mesh;
  scaleHandleTop: THREE.Mesh;
  scaleHandleBottom: THREE.Mesh;
  handles: THREE.Mesh[] = [];

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
    if (this.activeScaffold && !this.activeScaffold.extensionPole.visible)
      this.activeScaffold.removeExtensionFromScene(this.viewer.scene);
    if (pole) {
      this.activeScaffold = new Scaffold();
      this.activeScaffold.setMainPole(pole);
      this.activeScaffold.addExtensionToScene(this.viewer.scene);
      this.originalPosition = pole.position.clone();
      this.visible = true;
      this.setHandlePositions();
      this.setHandleColor();
      this.getActiveLashings();
    } else {
      this.activeScaffold = undefined;
      this.visible = false;
    }
  }

  setHandlePositions() {
    if (!this.activeScaffold) return;
    const pole = this.activeScaffold;
    const scaffoldCenter = this.activeScaffold.getCenter();
    this.position.set(scaffoldCenter.x, scaffoldCenter.y, scaffoldCenter.z);
    this.rotation.set(
      pole.mainPole.rotation.x,
      pole.mainPole.rotation.y,
      pole.mainPole.rotation.z
    );
    this.scaleHandleTop.position.y = pole.length / 2 - 0.25;
    this.scaleHandleBottom.position.y = -pole.length / 2 + 0.25;
  }

  setHandleColor() {
    if (!this.activeScaffold) return;
    for (const handle of this.handles) {
      // @ts-ignore
      handle.material.color = this.activeScaffold.mainPole.color;
    }
  }

  getActiveLashings() {
    this.lashingsOnActiveScaffold = this.viewer.inventory.lashings.filter(
      (lashing) =>
        lashing.fixedPole === this.activeScaffold.mainPole ||
        lashing.loosePole === this.activeScaffold.mainPole
    );
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

  dragHandle(handle: THREE.Mesh) {
    switch (handle) {
      case this.translationHandle:
        this.dragTranslationHandle();
        break;
      case this.scaleHandleTop:
        this.dragScaleHandle(true);
        break;
      case this.scaleHandleBottom:
        this.dragScaleHandle(false);
        break;
    }

    for (const lashing of this.lashingsOnActiveScaffold) {
      const distance = this.activeScaffold.extensionPole.visible
        ? Math.min(
            lashing.position.distanceTo(this.activeScaffold.mainPole.position),
            lashing.position.distanceTo(
              this.activeScaffold.extensionPole.position
            )
          )
        : lashing.position.distanceTo(this.activeScaffold.mainPole.position);
      lashing.visible = distance < this.activeScaffold.mainPole.length / 2.0;
    }
  }

  dragTranslationHandle() {
    if (!this.activeScaffold) return;

    const target = this.viewer.inputHandler.getPointOnLineClosestToCursor(
      this.originalPosition,
      this.activeScaffold.direction
    );

    this.activeScaffold.mainPole.position.set(target.x, target.y, target.z);
    this.setHandlePositions();
  }

  dragScaleHandle(topHandle: boolean) {
    if (!this.activeScaffold) return;

    const target = this.viewer.inputHandler.getPointOnLineClosestToCursor(
      this.originalPosition,
      this.activeScaffold.direction
    );

    const distTargetToPoleCenter = this.activeScaffold
      .getCenter()
      .distanceTo(target);

    this.activeScaffold.resize(
      topHandle,
      distTargetToPoleCenter + 0.2 + this.activeScaffold.length / 2
    );

    const newPosition = this.activeScaffold.getCenter();
    this.position.set(newPosition.x, newPosition.y, newPosition.z);
    this.setHandlePositions();
    this.setHandleColor();
    const newDistTargetToPoleCenter = this.activeScaffold
      .getCenter()
      .distanceTo(target);
    if (topHandle) {
      this.scaleHandleTop.position.y = newDistTargetToPoleCenter;
    } else {
      this.scaleHandleBottom.position.y = -newDistTargetToPoleCenter;
    }
    (this.viewer.scene as any).dispatchEvent({
      type: "pole_moved",
      pole: this.activeScaffold.mainPole,
    });
  }

  dropHandle(handle: THREE.Mesh) {
    switch (handle) {
      case this.translationHandle:
        break;
      case this.scaleHandleTop:
      case this.scaleHandleBottom:
        this.dropScaleHandle();
        break;
    }
    for (const lashing of this.lashingsOnActiveScaffold) {
      lashing.relashToRightScaffoldPole(this.activeScaffold);
      if (!lashing.visible) {
        this.viewer.inventory.removeLashing(lashing);
      } else {
        (this.viewer.scene as any).dispatchEvent({
          type: "lashing_relashed",
          lashing,
        });
      }
    }
    (this.viewer.scene as any).dispatchEvent({
      type: "pole_dropped",
      pole: this.activeScaffold.mainPole,
    });
  }

  dropScaleHandle() {
    if (!this.activeScaffold.extensionPole.visible) {
      this.activeScaffold.removeExtensionFromScene(this.viewer.scene);
    } else {
      const polesToAdd = this.activeScaffold.getVisibleExtenstionPoles();
      this.viewer.inventory.addPoles(polesToAdd);
    }
  }
}
