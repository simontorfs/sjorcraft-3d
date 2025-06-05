import * as THREE from "three";
import { Scaffold } from "../objects/scaffold";
import { Viewer } from "../viewer";
import { DistanceHelperLine } from "../objects/helperLine";
import { Tool } from "./tool";

export class PolypedestraTool extends Tool {
  scaffolds: Scaffold[] = [];

  midPointPlaced: boolean = false;
  onlyGroundPointPlaced: boolean = false;

  onlyGroundPoint: THREE.Vector3 = new THREE.Vector3();
  onlyGroundPointOffsetDefault: THREE.Vector3;
  onlyGroundPointOffset: THREE.Vector3;
  lashPosition: THREE.Vector3 = new THREE.Vector3();
  lashPositionProjectedOnFloor: THREE.Vector3 = new THREE.Vector3();
  defaultLashHeight: number = 3.0;
  lashHeight: number = this.defaultLashHeight;
  defaultNrOfPoles = 4;
  nrOfPoles: number = this.defaultNrOfPoles;

  theta: number = 0.0;
  gamma: number = 0.0;
  phi: number = 0.0;
  rotationMatrix: THREE.Matrix4 = new THREE.Matrix4();

  groundPositionLastMouseMove: THREE.Vector3 = new THREE.Vector3();

  verticalHelperLine: DistanceHelperLine = new DistanceHelperLine();
  polypedestraIsColliding: boolean = false;

  constructor(viewer: Viewer) {
    super(viewer);

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
    this.viewer.inventory.resetAllColors();
  }

  deactivate() {
    this.active = false;
    this.resetParameters();

    for (const scaffold of this.scaffolds) {
      scaffold.setInvisible();
    }
    this.viewer.inventory.resetAllColors();
  }

  resetParameters() {
    this.midPointPlaced = false;
    this.onlyGroundPointPlaced = false;
    this.lashHeight = this.defaultLashHeight;
    this.setNrOfPoles(this.defaultNrOfPoles);
    this.removeVerticalHelperLine();
  }

  onLeftClick() {
    if (!this.active) return;
    if (!this.midPointPlaced) {
      this.midPointPlaced = true;
    } else if (!this.onlyGroundPointPlaced) {
      this.onlyGroundPointPlaced = true;
      this.addVerticalHelperLine();
    } else {
      if (this.polypedestraIsColliding) return;

      const polesToAdd = [];
      const scaffoldLashingsToAdd = [];
      for (let i = 0; i < this.nrOfPoles; i++) {
        polesToAdd.push(...this.scaffolds[i].getVisiblePoles());
        scaffoldLashingsToAdd.push(
          ...this.scaffolds[i].getVisibleScaffoldLashings()
        );
        this.scaffolds[i] = new Scaffold();
        this.scaffolds[i].addToScene(this.viewer.scene);
      }
      this.viewer.inventory.addPoles(polesToAdd);
      this.viewer.inventory.addScaffoldLashings(scaffoldLashingsToAdd);
      this.resetParameters();
      this.setNrOfPoles(this.defaultNrOfPoles);
    }
  }

  onRightClick() {
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

  onArrowUp() {
    this.setNrOfPoles(Math.min(this.nrOfPoles + 1, 16));
  }

  onArrowDown() {
    this.setNrOfPoles(Math.max(this.nrOfPoles - 1, 3));
  }

  onMouseMove() {
    const groundPosition = this.viewer.inputHandler.getHoveredGroundPosition();
    this.drawPolypedestra(groundPosition);
  }

  drawPolypedestra(groundPosition: THREE.Vector3 | null) {
    this.groundPositionLastMouseMove = groundPosition;
    if (!this.midPointPlaced) {
      if (groundPosition) this.drawFirstStep(groundPosition);
    } else if (!this.onlyGroundPointPlaced) {
      if (groundPosition) this.drawSecondStep(groundPosition);
    } else {
      this.drawThirdStep();
    }
    this.checkCollisions();
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

    this.updatePhi();
    let vBottom = this.onlyGroundPointOffset.clone();
    let vTop = this.lashPosition
      .clone()
      .sub(this.onlyGroundPoint)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.phi)
      .add(this.onlyGroundPoint)
      .sub(this.lashPosition);

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

  updatePhi() {
    const R = this.onlyGroundPointOffset.length();
    this.gamma = Math.atan(R / this.lashHeight);

    const sinGamma = Math.sin(this.gamma);
    const cosGamma = Math.cos(this.gamma);
    const cosTheta = Math.cos(this.theta);

    const A =
      Math.abs(sinGamma) *
      Math.sqrt(
        Math.pow(cosGamma, 2) * Math.pow(cosTheta, 2) -
          2 * Math.pow(cosGamma, 2) * cosTheta +
          Math.pow(cosGamma, 2) -
          Math.pow(cosTheta, 2) +
          1
      );

    let sinPhi = Math.abs(
      (this.scaffolds[0].mainRadius * A) /
        (R * (cosTheta - 1) * cosGamma * sinGamma)
    );

    sinPhi = Math.max(-1.0, Math.min(1.0, sinPhi));

    this.phi = this.limitPhi(Math.asin(sinPhi));
  }

  limitPhi(phi: number) {
    return Math.min((Math.PI - this.theta) / 2, phi);
  }

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

  checkCollisions() {
    this.polypedestraIsColliding = false;
    this.viewer.domElement.style.cursor = "default";

    for (const pole of this.viewer.inventory.poles) {
      if (
        this.scaffolds.find(
          (scaffold) => scaffold.mainPole.visible && scaffold.overlaps(pole)
        )
      ) {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 0, 0);
        if (this.onlyGroundPointPlaced) {
          this.polypedestraIsColliding = true;
          this.viewer.domElement.style.cursor = "not-allowed";
        }
      } else {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 1, 1);
      }
    }
  }
}
