import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

export class BipodTool {
  active: boolean;
  viewer: Viewer;

  pole1: Pole;
  pole2: Pole;

  pole1Placed: boolean = false;
  pole2Placed: boolean = false;

  firstGroundPoint: THREE.Vector3;
  secondGroundPoint: THREE.Vector3;

  constructor(viewer: Viewer) {
    this.active = false;
    this.viewer = viewer;
    this.pole1 = new Pole();
    this.pole2 = new Pole();
    this.firstGroundPoint = new THREE.Vector3();
  }

  activate() {
    this.active = true;
    this.viewer.scene.add(this.pole1);
    this.viewer.scene.add(this.pole2);
  }

  deactivate() {
    this.active = false;
    this.viewer.scene.remove(this.pole1);
    this.viewer.scene.remove(this.pole2);
    this.pole1Placed = false;
    this.pole2Placed = false;
  }

  drawBipod(groundPosition: THREE.Vector3) {
    if (!this.pole1Placed) {
      this.drawFirstStep(groundPosition);
    } else if (!this.pole2Placed) {
      this.drawSecondStep(groundPosition);
    } else {
      this.drawThridStep(groundPosition);
    }
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.pole1.position.set(
      groundPosition.x,
      groundPosition.y + this.pole1.length / 2.0,
      groundPosition.z
    );
    this.pole2.position.set(
      groundPosition.x + 0.14,
      groundPosition.y + this.pole1.length / 2.0,
      groundPosition.z
    );
    this.firstGroundPoint = groundPosition.clone();
  }

  drawSecondStep(groundPosition: THREE.Vector3) {
    const center = groundPosition
      .clone()
      .add(this.firstGroundPoint)
      .divideScalar(2.0);

    const lashingHeight = Math.sqrt(
      Math.pow(3.8, 2) - Math.pow(groundPosition.distanceTo(center), 2)
    );

    const perpendicularDirection = new THREE.Vector3()
      .crossVectors(
        groundPosition.clone().sub(center),
        new THREE.Vector3(0, 1, 0)
      )
      .normalize();

    this.pole1.setPositionBetweenGroundAndPole(
      this.firstGroundPoint,
      new THREE.Vector3(
        center.x + perpendicularDirection.x * 0.07,
        lashingHeight,
        center.z + perpendicularDirection.z * 0.07
      )
    );
    this.pole2.setPositionBetweenGroundAndPole(
      groundPosition,
      new THREE.Vector3(
        center.x - perpendicularDirection.x * 0.07,
        lashingHeight,
        center.z - perpendicularDirection.z * 0.07
      )
    );
    this.secondGroundPoint = groundPosition;
  }

  drawThridStep(groundPosition: THREE.Vector3) {
    const points = [this.firstGroundPoint, this.secondGroundPoint];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color: 0x0000ff,
      dashSize: 0.05,
      gapSize: 0.05,
    });

    const axis = new THREE.Line(geometry, material);
    axis.computeLineDistances();
    this.viewer.scene.add(axis);
  }

  leftClick() {
    if (!this.active) return;

    if (!this.pole1Placed) {
      this.pole1Placed = true;
    } else if (!this.pole2Placed) {
      this.pole2Placed = true;
    } else {
      this.viewer.poles.push(this.pole1);
      this.viewer.poles.push(this.pole2);
      this.pole1 = new Pole();
      this.pole2 = new Pole();
      this.viewer.scene.add(this.pole1);
      this.viewer.scene.add(this.pole2);
      this.pole1Placed = false;
      this.pole2Placed = false;
    }
  }
}
