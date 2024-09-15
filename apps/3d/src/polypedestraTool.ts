import * as THREE from "three";
import { Scaffold } from "./scaffold";
import { Viewer } from "./viewer";
import { HelperLine } from "./helperLine";

export class PolypedestraTool {
  active: boolean = false;
  viewer: Viewer;

  scaffolds: Scaffold[] = [];

  midPointPlaced: boolean = false;
  onlyGroundPointPlaced: boolean = false;

  onlyGroundPoint: THREE.Vector3 = new THREE.Vector3();
  onlyGroundPointOffsetDefault: THREE.Vector3;
  onlyGroundPointOffset: THREE.Vector3;
  lashingOffset: THREE.Vector3;
  lashPosition: THREE.Vector3 = new THREE.Vector3();
  lashPositionProjectedOnFloor: THREE.Vector3 = new THREE.Vector3();
  defaultLashHeight: number = 3.0;
  lashHeight: number = this.defaultLashHeight;
  defaultNrOfPoles = 4;
  nrOfPoles: number = this.defaultNrOfPoles;

  theta: number = 0.0;
  rotationMatrix: THREE.Matrix4 = new THREE.Matrix4();

  groundPositionLastMouseMove: THREE.Vector3 = new THREE.Vector3();

  verticalHelperLine: HelperLine = new HelperLine();

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    for (let i = 0; i < 16; i++) {
      const scaffold = new Scaffold();
      scaffold.setInvisible();
      this.scaffolds.push(scaffold);
      scaffold.addToScene(this.viewer.scene);
    }
  }

  setNrOfPoles(nrOfPoles: number) {
    this.nrOfPoles = nrOfPoles;
    this.theta = (2 * Math.PI) / this.nrOfPoles;
    this.rotationMatrix = new THREE.Matrix4().makeRotationY(this.theta);
    const offset =
      (this.scaffolds[0].mainRadius + 0.02) /
      Math.sin(Math.PI / this.nrOfPoles);
    this.onlyGroundPointOffsetDefault = new THREE.Vector3(offset, 0, 0);
    for (let i = 0; i < 16; i++) {
      if (i < this.nrOfPoles) this.scaffolds[i].setVisible();
      else this.scaffolds[i].setInvisible();
    }
    this.drawPolypedestra(this.groundPositionLastMouseMove);
  }

  activate() {
    this.active = true;
    this.setNrOfPoles(this.defaultNrOfPoles);
    for (let i = 0; i < 16; i++) {
      this.scaffolds[i].setPositions(new THREE.Vector3(0, 200, 0));
    }
  }

  deactivate() {
    this.active = false;
    this.resetParameters();

    for (const scaffold of this.scaffolds) {
      scaffold.setInvisible();
    }
  }

  resetParameters() {
    this.midPointPlaced = false;
    this.onlyGroundPointPlaced = false;
    this.lashHeight = this.defaultLashHeight;
    this.setNrOfPoles(this.defaultNrOfPoles);
    this.removeVerticalHelperLine();
  }

  leftClick() {
    if (!this.active) return;
    if (!this.midPointPlaced) {
      this.midPointPlaced = true;
    } else if (!this.onlyGroundPointPlaced) {
      this.onlyGroundPointPlaced = true;
      this.addVerticalHelperLine();
    } else {
      for (let i = 0; i < this.nrOfPoles; i++) {
        this.scaffolds[i].addToViewer(this.viewer);
        this.scaffolds[i] = new Scaffold();
        this.scaffolds[i].addToScene(this.viewer.scene);
      }
      this.resetParameters();
      this.setNrOfPoles(this.defaultNrOfPoles);
    }
  }

  rightClick() {
    if (!this.active) return;
    if (this.onlyGroundPointPlaced) {
      this.onlyGroundPointPlaced = false;
      this.removeVerticalHelperLine();
    } else if (this.midPointPlaced) {
      this.midPointPlaced = false;
    } else {
      this.resetParameters();
    }
    this.drawPolypedestra(this.groundPositionLastMouseMove);
  }

  arrowUp() {
    this.setNrOfPoles(Math.min(this.nrOfPoles + 1, 16));
  }

  arrowDown() {
    this.setNrOfPoles(Math.max(this.nrOfPoles - 1, 3));
  }

  drawPolypedestra(groundPosition: THREE.Vector3) {
    this.groundPositionLastMouseMove = groundPosition;
    if (!this.midPointPlaced) {
      this.drawFirstStep(groundPosition);
    } else if (!this.onlyGroundPointPlaced) {
      this.drawSecondStep(groundPosition);
    } else {
      this.drawThirdStep();
    }
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.lashPositionProjectedOnFloor = groundPosition.clone();
    this.lashPosition = new THREE.Vector3(
      this.lashPositionProjectedOnFloor.x,
      this.lashHeight,
      this.lashPositionProjectedOnFloor.z
    );

    let v = this.onlyGroundPointOffsetDefault.clone();
    for (let i = 0; i < this.nrOfPoles; i++) {
      this.scaffolds[i].setPositionOnGround(groundPosition.clone().add(v));
      v.applyMatrix4(this.rotationMatrix);
    }
  }

  drawSecondStep(groundPosition: THREE.Vector3) {
    this.onlyGroundPoint = groundPosition;
    this.onlyGroundPointOffset = groundPosition
      .clone()
      .sub(this.lashPositionProjectedOnFloor);

    this.lashingOffset = this.onlyGroundPointOffset
      .clone()
      .normalize()
      .multiplyScalar(this.onlyGroundPointOffsetDefault.length());

    let vBottom = this.onlyGroundPointOffset.clone();
    let vTop = this.lashingOffset.clone();

    const idealRotationTop = this.getIdealRotationTop();
    vTop.applyMatrix4(idealRotationTop);

    for (let i = 0; i < this.nrOfPoles; i++) {
      this.scaffolds[i].setPositionBetweenGroundAndPole(
        this.lashPositionProjectedOnFloor.clone().add(vBottom),
        this.lashPosition.clone().add(vTop)
      );
      vBottom.applyMatrix4(this.rotationMatrix);
      vTop.applyMatrix4(this.rotationMatrix);
    }
  }

  drawThirdStep() {
    let target = this.viewer.inputHandler.getPointOnLineClosestToCursor(
      this.lashPositionProjectedOnFloor,
      new THREE.Vector3(0, 1, 0)
    );

    this.lashHeight = target.y;

    this.lashPosition = new THREE.Vector3(
      this.lashPositionProjectedOnFloor.x,
      this.lashHeight,
      this.lashPositionProjectedOnFloor.z
    );

    this.updateVerticalHelperLine();

    this.drawSecondStep(this.onlyGroundPoint);
  }

  getIdealRotationTop() {
    let bestRotationSoFar = 0.0;
    let bestDistanceSoFar = Infinity;
    for (let alpha = 0; alpha < (3 * Math.PI) / 4.0; alpha += 0.01) {
      const tryRotation = new THREE.Matrix4().makeRotationY(alpha);

      const Pa = this.lashPositionProjectedOnFloor
        .clone()
        .add(this.onlyGroundPointOffset);
      const PaTop = this.lashPosition
        .clone()
        .add(this.lashingOffset.clone().applyMatrix4(tryRotation));
      const Pb = this.lashPositionProjectedOnFloor
        .clone()
        .add(
          this.onlyGroundPointOffset.clone().applyMatrix4(this.rotationMatrix)
        );
      const PbTop = this.lashPosition
        .clone()
        .add(
          this.lashingOffset
            .clone()
            .applyMatrix4(tryRotation)
            .applyMatrix4(this.rotationMatrix)
        );
      const Da = Pa.clone().sub(PaTop);
      const Db = Pb.clone().sub(PbTop);
      const d = this.distanceBetweenLines(Pa, Da, Pb, Db);
      if (Math.abs(d - 0.12) < bestDistanceSoFar) {
        bestDistanceSoFar = Math.abs(d - 0.12);
        bestRotationSoFar = alpha;
        if (bestDistanceSoFar < 0.001) break;
      }
    }

    return new THREE.Matrix4().makeRotationY(bestRotationSoFar);
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

  addVerticalHelperLine() {
    this.updateVerticalHelperLine();
    this.viewer.scene.add(this.verticalHelperLine);
  }

  updateVerticalHelperLine() {
    const points = [this.lashPositionProjectedOnFloor, this.lashPosition];
    this.verticalHelperLine.setBetweenPoints(points);
  }

  removeVerticalHelperLine() {
    this.viewer.scene.remove(this.verticalHelperLine);
  }
}
