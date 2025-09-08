import * as THREE from "three";
import { Pole } from "../objects/pole";
import { Viewer } from "../viewer";
import { Scaffold } from "../objects/scaffold";
import { SquareLashing } from "../objects/lashings/squareLashing";
import { BipodLashing } from "../objects/lashings/bipodLashing";
import { Lashing } from "../objects/lashings/lashing";
import { ScaffoldLashing } from "../objects/lashings/scaffoldLashing";
import { TripodLashing } from "../objects/lashings/tripodLashing";

export class PoleTransformer extends THREE.Object3D {
  viewer: Viewer;
  activeScaffold: Scaffold | undefined = undefined;
  originalPosition: THREE.Vector3 = new THREE.Vector3();
  lashingsOnActiveScaffold: Lashing[] = [];
  connectedPole: Pole | undefined = undefined;

  translationHandle: THREE.Mesh;
  scaleHandleTop: THREE.Mesh;
  scaleHandleBottom: THREE.Mesh;
  rotationHandle: THREE.Mesh;
  rotationHandleHitbox: THREE.Mesh;
  handles: THREE.Mesh[] = [];

  constructor(viewer: Viewer) {
    super();
    this.viewer = viewer;
    const geometry = new THREE.CylinderGeometry(0.061, 0.061, 0.1);

    this.translationHandle = new THREE.Mesh(geometry, this.getHandleMaterial());
    this.scaleHandleTop = new THREE.Mesh(geometry, this.getHandleMaterial());
    this.scaleHandleBottom = new THREE.Mesh(geometry, this.getHandleMaterial());
    const torusGeometry = new THREE.TorusGeometry(0.2, 0.03, 16, 100);
    this.rotationHandle = new THREE.Mesh(
      torusGeometry,
      this.getHandleMaterial()
    );
    this.rotationHandle.rotation.x = Math.PI / 2;

    this.add(this.translationHandle);
    this.add(this.scaleHandleTop);
    this.add(this.scaleHandleBottom);
    this.add(this.rotationHandle);
    this.visible = false;

    this.handles = [
      this.translationHandle,
      this.scaleHandleTop,
      this.scaleHandleBottom,
      this.rotationHandle,
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

      this.rotationHandle.visible = this.canRotate(pole);
    } else {
      this.activeScaffold = undefined;
      this.visible = false;
      this.connectedPole = undefined;
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
    if (!this.activeScaffold) return;
    this.lashingsOnActiveScaffold = [
      ...this.viewer.inventory.lashings.filter(
        (lashing) =>
          lashing.fixedPole === this.activeScaffold!.mainPole ||
          lashing.loosePole === this.activeScaffold!.mainPole
      ),
      ...this.viewer.inventory.bipodLashings.filter(
        (lashing) =>
          lashing.pole1 === this.activeScaffold!.mainPole ||
          lashing.pole2 === this.activeScaffold!.mainPole
      ),
      ...this.viewer.inventory.tripodLashings.filter(
        (lashing) =>
          lashing.leftPole === this.activeScaffold!.mainPole ||
          lashing.middlePole === this.activeScaffold!.mainPole ||
          lashing.rightPole === this.activeScaffold!.mainPole
      ),
      ...this.viewer.inventory.scaffoldLashings.filter(
        (lashing) =>
          lashing.pole1 === this.activeScaffold!.mainPole ||
          lashing.pole2 === this.activeScaffold!.mainPole
      ),
    ];
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
    if (!this.activeScaffold) return;

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
      case this.rotationHandle:
        this.dragRotationHandle();
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

  dragRotationHandle() {
    if (!this.activeScaffold || !this.connectedPole) return;

    const pole = this.activeScaffold.mainPole;
    const angle = 0.05;
    const rotationAxis = this.connectedPole.direction.clone().normalize();
    const vectorFromConnectedPoleBase = pole.position
      .clone()
      .sub(this.connectedPole.position);
    const projection = vectorFromConnectedPoleBase.dot(rotationAxis);
    const rotationPivot = this.connectedPole.position
      .clone()
      .add(rotationAxis.clone().multiplyScalar(projection));
    pole.position.sub(rotationPivot);
    pole.position.applyAxisAngle(rotationAxis, angle);
    pole.position.add(rotationPivot);
    pole.rotateOnWorldAxis(rotationAxis, angle);
    this.setHandlePositions();

    for (const lashing of this.lashingsOnActiveScaffold) {
      lashing.position.sub(rotationPivot);
      lashing.position.applyAxisAngle(rotationAxis, angle);
      lashing.position.add(rotationPivot);
      lashing.rotateOnWorldAxis(rotationAxis, angle);
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
    if (!this.activeScaffold) return;

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
        if (lashing instanceof SquareLashing) {
          this.viewer.inventory.removeLashings([lashing]);
        } else if (lashing instanceof BipodLashing) {
          this.viewer.inventory.removeBipodLashings([lashing]);
        } else if (lashing instanceof TripodLashing) {
          this.viewer.inventory.removeTripodLashings([lashing]);
        } else if (lashing instanceof ScaffoldLashing) {
          this.viewer.inventory.removeScaffoldLashings([lashing]);
        }
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
    if (!this.activeScaffold) return;

    if (!this.activeScaffold.extensionPole.visible) {
      this.activeScaffold.removeExtensionFromScene(this.viewer.scene);
    } else {
      const polesToAdd = this.activeScaffold.getVisibleExtenstionPoles();
      this.viewer.inventory.addPoles(polesToAdd);
      this.viewer.inventory.addScaffoldLashings(
        this.activeScaffold.scaffoldLashings
      );
    }
  }

  canRotate(pole: Pole) {
    this.connectedPole = undefined;
    let canRotate = false;
    const scaffoldLashings = this.lashingsOnActiveScaffold.filter(
      (lashing) => lashing instanceof ScaffoldLashing
    ) as ScaffoldLashing[];

    if (
      scaffoldLashings.length === 2 &&
      this.lashingsOnActiveScaffold.length === 2
    ) {
      const otherPole1 =
        scaffoldLashings[0].pole1 === pole
          ? scaffoldLashings[0].pole2
          : scaffoldLashings[0].pole1;
      const otherPole2 =
        scaffoldLashings[1].pole1 === pole
          ? scaffoldLashings[1].pole2
          : scaffoldLashings[1].pole1;

      if (otherPole1 && otherPole2 && otherPole1 === otherPole2) {
        canRotate = true;
        this.connectedPole = otherPole1;
      }
    } else if (
      scaffoldLashings.length === 4 &&
      this.lashingsOnActiveScaffold.length === 4
    ) {
      const otherPoles = new Set<Pole>();
      scaffoldLashings.forEach((lashing) => {
        if (lashing.pole1 !== pole) otherPoles.add(lashing.pole1);
        if (lashing.pole2 !== pole) otherPoles.add(lashing.pole2);
      });
      if (otherPoles.size === 2) {
        const [poleA, poleB] = Array.from(otherPoles);
        const vectorAB = poleB.position.clone().sub(poleA.position).normalize();
        const vectorABParallelToPoles =
          Math.abs(
            vectorAB.normalize().dot(pole.direction.clone().normalize())
          ) >
          1 - 1e-6;

        if (vectorABParallelToPoles) {
          canRotate = true;
          this.connectedPole = poleA;
        }
      }
    }
    return canRotate;
  }
}
