import { Scaffold } from "../objects/scaffold";
import * as THREE from "three";
import { Viewer } from "../viewer";
import { HelperLine, DistanceHelperLine } from "../objects/helperLine";
import { BipodLashing } from "../objects/lashings/bipodLashing";
import { Tool } from "./tool";

export class BipodTool extends Tool {
  scaffold1: Scaffold = new Scaffold();
  scaffold2: Scaffold = new Scaffold();
  lashing: BipodLashing = new BipodLashing(this.scaffold1, this.scaffold2);

  scaffold1Placed: boolean = false;
  scaffold2Placed: boolean = false;
  lashPositionPlaced: boolean = false;

  firstGroundPoint: THREE.Vector3 = new THREE.Vector3();
  secondGroundPoint: THREE.Vector3 = new THREE.Vector3();
  lashPosition: THREE.Vector3 = new THREE.Vector3();
  lashPositionProjectedOnFloor: THREE.Vector3 = new THREE.Vector3();
  defaultLashHeight: number = 3.0;
  lashHeight: number = this.defaultLashHeight;

  parallelHelperLine: HelperLine = new DistanceHelperLine();
  perpendicularHelperLine: HelperLine = new DistanceHelperLine();
  verticalHelperLine: DistanceHelperLine = new DistanceHelperLine();

  bipodIsColliding: boolean = false;

  constructor(viewer: Viewer) {
    super(viewer);
    this.viewer.scene.add(this.lashing);

    this.parallelHelperLine.visible = false;
    this.perpendicularHelperLine.visible = false;
    this.verticalHelperLine.visible = false;
    this.viewer.scene.add(
      this.parallelHelperLine,
      this.perpendicularHelperLine,
      this.verticalHelperLine
    );
  }

  activate() {
    this.active = true;
    this.resetParameters();
    this.scaffold1.addToScene(this.viewer.scene);
    this.scaffold2.addToScene(this.viewer.scene);
  }

  deactivate() {
    this.active = false;
    this.scaffold1.removeFromScene(this.viewer.scene);
    this.scaffold2.removeFromScene(this.viewer.scene);
    this.removeHorizontalHelperLines();
    this.verticalHelperLine.visible = false;
    this.resetParameters();
    this.viewer.inventory.resetAllColors();
  }

  resetParameters() {
    this.scaffold1Placed = false;
    this.scaffold2Placed = false;
    this.lashPositionPlaced = false;
    this.lashHeight = this.defaultLashHeight;
    this.scaffold1.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold2.setPositions(new THREE.Vector3(0, 200, 0));
  }

  onLeftClick() {
    if (!this.active) return;

    if (!this.scaffold1Placed) {
      this.scaffold1Placed = true;
      this.parallelHelperLine.visible = true;
    } else if (!this.scaffold2Placed) {
      this.scaffold2Placed = true;
      this.perpendicularHelperLine.visible = true;
      this.addVerticalHelperLine();
    } else if (!this.lashPositionPlaced) {
      this.lashPositionPlaced = true;
    } else {
      if (this.bipodIsColliding) return;
      this.removeHorizontalHelperLines();
      this.verticalHelperLine.visible = false;
      const polesToAdd = [
        ...this.scaffold1.getVisiblePoles(),
        ...this.scaffold2.getVisiblePoles(),
      ];
      this.viewer.inventory.addPoles(polesToAdd);
      const scaffoldLashingsToAdd = [
        ...this.scaffold1.getVisibleScaffoldLashings(),
        ...this.scaffold2.getVisibleScaffoldLashings(),
      ];
      this.viewer.inventory.addScaffoldLashings(scaffoldLashingsToAdd);
      this.scaffold1 = new Scaffold();
      this.scaffold2 = new Scaffold();
      this.scaffold1.addToScene(this.viewer.scene);
      this.scaffold2.addToScene(this.viewer.scene);
      this.viewer.inventory.addBipodLashings([this.lashing]);
      this.lashing = new BipodLashing(this.scaffold1, this.scaffold2);
      this.viewer.scene.add(this.lashing);
      this.resetParameters();
    }
  }

  onRightClick() {
    if (!this.active) return;

    if (this.lashPositionPlaced) {
      this.lashPositionPlaced = false;
    } else if (this.scaffold2Placed) {
      this.scaffold2Placed = false;
      this.verticalHelperLine.visible = false;
      this.perpendicularHelperLine.visible = false;
    } else if (this.scaffold1Placed) {
      this.scaffold1Placed = false;
      this.parallelHelperLine.visible = false;
    } else {
      this.resetParameters();
    }
  }

  onMouseMove() {
    const groundPosition = this.viewer.inputHandler.getHoveredGroundPosition();
    this.drawBipod(groundPosition);
  }

  drawBipod(groundPosition: THREE.Vector3 | null) {
    if (!this.scaffold1Placed) {
      if (groundPosition) this.drawFirstStep(groundPosition);
    } else if (!this.scaffold2Placed) {
      if (groundPosition) this.drawSecondStep(groundPosition);
    } else if (!this.lashPositionPlaced) {
      if (groundPosition) this.drawThirdStep(groundPosition);
    } else {
      this.drawFourthStep();
    }
    this.checkCollisions();
    this.lashing.update();
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.scaffold1.setPositionOnGround(groundPosition);
    this.scaffold2.setPositionOnGround(
      groundPosition
        .clone()
        .add(
          new THREE.Vector3(
            this.scaffold1.mainRadius + this.scaffold2.mainRadius,
            0,
            0
          )
        )
    );
    this.firstGroundPoint = groundPosition;
  }

  drawSecondStep(groundPosition: THREE.Vector3) {
    this.secondGroundPoint = groundPosition;
    this.lashPositionProjectedOnFloor = this.getCenter();
    this.calculatePositions();
    this.updateHelperLines();
  }

  drawThirdStep(groundPosition: THREE.Vector3) {
    this.lashPositionProjectedOnFloor = groundPosition;
    this.calculatePositions();
    this.updateHelperLines();
  }

  drawFourthStep() {
    let target = this.viewer.inputHandler.getPointOnLineClosestToCursor(
      this.lashPositionProjectedOnFloor,
      new THREE.Vector3(0, 1, 0)
    );

    this.lashHeight = target.y;

    this.calculatePositions();
    this.updateHelperLines();
  }

  calculatePositions() {
    const lashingOffset = new THREE.Vector3()
      .crossVectors(this.scaffold1.direction, this.scaffold2.direction)
      .normalize()
      .multiplyScalar(
        (this.scaffold1.mainRadius + this.scaffold2.mainRadius) / 2.0
      );

    this.lashPosition = new THREE.Vector3(
      this.lashPositionProjectedOnFloor.x,
      this.lashHeight,
      this.lashPositionProjectedOnFloor.z
    );

    const centerScaffold1 = this.lashPosition.clone().add(lashingOffset);
    const centerScaffold2 = this.lashPosition.clone().sub(lashingOffset);

    this.scaffold1.setPositionBetweenGroundAndPole(
      this.firstGroundPoint,
      centerScaffold1
    );
    this.scaffold2.setPositionBetweenGroundAndPole(
      this.secondGroundPoint,
      centerScaffold2
    );
  }

  getCenter() {
    return this.firstGroundPoint
      .clone()
      .add(this.secondGroundPoint)
      .divideScalar(2.0);
  }

  AddHorizontalHelperLines() {
    this.updateHelperLines();
    this.parallelHelperLine.visible = true;
    this.perpendicularHelperLine.visible = true;
  }

  removeHorizontalHelperLines() {
    this.parallelHelperLine.visible = false;
    this.perpendicularHelperLine.visible = false;
  }

  addVerticalHelperLine() {
    this.updateHelperLines();
    this.verticalHelperLine.visible = true;
  }

  updateHelperLines() {
    const vectorPole1ToPole2 = this.secondGroundPoint
      .clone()
      .sub(this.firstGroundPoint)
      .normalize();
    const Alength = vectorPole1ToPole2.dot(
      this.lashPositionProjectedOnFloor.clone().sub(this.firstGroundPoint)
    );
    const projectedLashPoint = vectorPole1ToPole2
      .clone()
      .multiplyScalar(Alength)
      .add(this.firstGroundPoint);

    this.perpendicularHelperLine.setBetweenPoints([
      projectedLashPoint,
      this.lashPositionProjectedOnFloor,
    ]);

    if (this.scaffold2Placed) {
      this.parallelHelperLine.setBetweenPoints([
        this.firstGroundPoint,
        projectedLashPoint,
        this.secondGroundPoint,
      ]);
    } else {
      this.parallelHelperLine.setBetweenPoints([
        this.firstGroundPoint,
        this.secondGroundPoint,
      ]);
    }

    const points = [this.lashPositionProjectedOnFloor, this.lashPosition];
    this.verticalHelperLine.setBetweenPoints(points);
  }

  checkCollisions() {
    this.bipodIsColliding = false;
    this.viewer.domElement.style.cursor = "default";

    for (const pole of this.viewer.inventory.poles) {
      if (this.scaffold1.overlaps(pole) || this.scaffold2.overlaps(pole)) {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 0, 0);
        if (this.lashPositionPlaced) {
          this.bipodIsColliding = true;
          this.viewer.domElement.style.cursor = "not-allowed";
        }
      } else {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 1, 1);
      }
    }
  }
}
