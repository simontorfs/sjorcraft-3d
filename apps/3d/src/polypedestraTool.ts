import * as THREE from "three";
import { Scaffold } from "./scaffold";
import { Viewer } from "./viewer";

export class PolypedestraTool {
  active: boolean = false;
  viewer: Viewer;

  scaffolds: Scaffold[] = [];

  midPointPlaced: boolean = false;
  onlyGoundPointPlaced: boolean = false;

  onlyGroundPointOffsetDefault: THREE.Vector3;
  onlyGroundPointOffset: THREE.Vector3;
  lashPosition: THREE.Vector3 = new THREE.Vector3();
  lashPositionProjectedOnFloor: THREE.Vector3 = new THREE.Vector3();
  defaultLashHeight: number = 3.0;
  lashHeight: number = this.defaultLashHeight;
  defaultNrOfPoles = 12;
  nrOfPoles: number = this.defaultNrOfPoles;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    for (let i = 0; i < 16; i++) {
      const scaffold = new Scaffold();
      scaffold.setInvisible();
      this.scaffolds.push(scaffold);
      scaffold.addToScene(this.viewer.scene);
    }
    const offset =
      (this.scaffolds[0].mainRadius + 0.02) /
      Math.sin(Math.PI / this.nrOfPoles);
    this.onlyGroundPointOffsetDefault = new THREE.Vector3(offset, 0, 0);
  }

  activate() {
    this.active = true;
    this.nrOfPoles = this.defaultNrOfPoles;
    for (let i = 0; i < 16; i++) {
      this.scaffolds[i].setPositions(new THREE.Vector3(0, 200, 0));
      if (i < this.nrOfPoles) this.scaffolds[i].setVisible();
    }
  }

  deactivate() {
    this.active = false;
    for (const scaffold of this.scaffolds) {
      scaffold.setInvisible();
    }
    this.resetParameters();
  }

  resetParameters() {
    this.midPointPlaced = false;
    this.lashHeight = this.defaultLashHeight;
    this.nrOfPoles = 3;
  }

  leftClick() {
    if (!this.active) return;
    if (!this.midPointPlaced) {
      this.midPointPlaced = true;
    } else {
      for (let i = 0; i < this.nrOfPoles; i++) {
        this.scaffolds[i].addToViewer(this.viewer);
        this.scaffolds[i] = new Scaffold();
        this.scaffolds[i].addToScene(this.viewer.scene);
      }
      this.resetParameters();
    }
  }

  rightClick() {
    if (!this.active) return;
  }

  drawPolypedestra(groundPosition: THREE.Vector3) {
    if (!this.midPointPlaced) {
      this.drawFirstStep(groundPosition);
    } else {
      this.drawSecondStep(groundPosition);
    }
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.lashPositionProjectedOnFloor = groundPosition.clone();
    let v = this.onlyGroundPointOffsetDefault.clone();
    const theta = (2 * Math.PI) / this.nrOfPoles;
    const rotationMatrix = new THREE.Matrix4().makeRotationY(theta);
    for (let i = 0; i < this.nrOfPoles; i++) {
      this.scaffolds[i].setPositionOnGround(groundPosition.clone().add(v));
      v.applyMatrix4(rotationMatrix);
    }
  }

  drawSecondStep(groundPosition: THREE.Vector3) {
    this.onlyGroundPointOffset = groundPosition
      .clone()
      .sub(this.lashPositionProjectedOnFloor);

    this.lashPosition = new THREE.Vector3(
      this.lashPositionProjectedOnFloor.x,
      this.lashHeight,
      this.lashPositionProjectedOnFloor.z
    );

    const smallOffset = this.onlyGroundPointOffset
      .clone()
      .normalize()
      .multiplyScalar(this.onlyGroundPointOffsetDefault.length());

    let v = this.onlyGroundPointOffset.clone();
    const theta = (2 * Math.PI) / this.nrOfPoles;
    const rotationMatrix = new THREE.Matrix4().makeRotationY(theta);
    for (let i = 0; i < this.nrOfPoles; i++) {
      smallOffset.applyMatrix4(rotationMatrix);
      this.scaffolds[i].setPositionBetweenGroundAndPole(
        this.lashPositionProjectedOnFloor.clone().add(v),
        this.lashPosition.clone().add(smallOffset)
      );
      v.applyMatrix4(rotationMatrix);
    }
  }

  distanceBetweenLines = (
    Pa: THREE.Vector3,
    Da: THREE.Vector3,
    Pb: THREE.Vector3,
    Db: THREE.Vector3
  ) => {
    const PaPb = new THREE.Vector3().subVectors(Pb, Pa);
    const crossD = new THREE.Vector3().crossVectors(Da, Db);
    const numerator = Math.abs(PaPb.dot(crossD));
    const denominator = crossD.length();
    return numerator / denominator;
  };
}
