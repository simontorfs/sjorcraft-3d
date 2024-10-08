import * as THREE from "three";
import { Scaffold } from "../objects/scaffold";
import { Viewer } from "../viewer";
import { DistanceHelperLine } from "../objects/helperLine";

export class TripodTool {
  active: boolean = false;
  viewer: Viewer;

  scaffold1: Scaffold = new Scaffold();
  scaffold2: Scaffold = new Scaffold();
  scaffold3: Scaffold = new Scaffold();

  scaffold1Placed: boolean = false;
  scaffold2Placed: boolean = false;
  scaffold3Placed: boolean = false;
  lashPositionPlaced: boolean = false;

  firstGroundPoint: THREE.Vector3 = new THREE.Vector3();
  secondGroundPoint: THREE.Vector3 = new THREE.Vector3();
  thirdGroundPoint: THREE.Vector3 = new THREE.Vector3();
  lashPosition: THREE.Vector3 = new THREE.Vector3();
  lashPositionProjectedOnFloor: THREE.Vector3 = new THREE.Vector3();
  defaultLashHeight: number = 3.0;
  lashHeight: number = this.defaultLashHeight;

  horizontalHelperLines: DistanceHelperLine[] = [];

  verticalHelperLine: DistanceHelperLine = new DistanceHelperLine();

  tripodIsColliding: boolean = false;

  constructor(viewer: Viewer) {
    this.viewer = viewer;

    for (let i = 0; i < 3; i++) {
      const line = new DistanceHelperLine();
      line.visible = false;
      this.horizontalHelperLines.push(line);
      this.viewer.scene.add(line);
    }

    this.verticalHelperLine.visible = false;
    this.viewer.scene.add(this.verticalHelperLine);
  }

  activate() {
    this.active = true;
    this.scaffold1.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold2.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold3.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold1.addToScene(this.viewer.scene);
    this.scaffold2.addToScene(this.viewer.scene);
    this.scaffold3.addToScene(this.viewer.scene);
  }

  deactivate() {
    this.active = false;
    this.scaffold1.removeFromScene(this.viewer.scene);
    this.scaffold2.removeFromScene(this.viewer.scene);
    this.scaffold3.removeFromScene(this.viewer.scene);
    this.horizontalHelperLines.map((line) => (line.visible = false));
    this.verticalHelperLine.visible = false;
    this.resetParameters();
  }

  resetParameters() {
    this.scaffold1Placed = false;
    this.scaffold2Placed = false;
    this.scaffold3Placed = false;
    this.lashPositionPlaced = false;
    this.lashHeight = this.defaultLashHeight;
  }

  leftClick() {
    if (!this.scaffold1Placed) {
      this.scaffold1Placed = true;
      this.horizontalHelperLines[0].visible = true;
    } else if (!this.scaffold2Placed) {
      this.scaffold2Placed = true;
      this.horizontalHelperLines[1].visible = true;
      this.horizontalHelperLines[2].visible = true;
    } else if (!this.scaffold3Placed) {
      this.scaffold3Placed = true;
      this.verticalHelperLine.visible = true;
    } else if (!this.lashPositionPlaced) {
      this.lashPositionPlaced = true;
    } else {
      if (this.tripodIsColliding) return;
      this.verticalHelperLine.visible = false;
      this.horizontalHelperLines.map((line) => (line.visible = false));
      this.scaffold1.addToViewer(this.viewer);
      this.scaffold2.addToViewer(this.viewer);
      this.scaffold3.addToViewer(this.viewer);
      this.scaffold1 = new Scaffold();
      this.scaffold2 = new Scaffold();
      this.scaffold3 = new Scaffold();
      this.scaffold1.addToScene(this.viewer.scene);
      this.scaffold2.addToScene(this.viewer.scene);
      this.scaffold3.addToScene(this.viewer.scene);
      this.resetParameters();
    }
    this.updateHelperLines();
  }

  rightClick() {
    if (!this.active) return;

    if (this.lashPositionPlaced) {
      this.lashPositionPlaced = false;
    } else if (this.scaffold3Placed) {
      this.scaffold3Placed = false;
      this.verticalHelperLine.visible = false;
    } else if (this.scaffold2Placed) {
      this.scaffold2Placed = false;
      this.horizontalHelperLines[1].visible = false;
      this.horizontalHelperLines[2].visible = false;
    } else if (this.scaffold1Placed) {
      this.scaffold1Placed = false;
      this.horizontalHelperLines[0].visible = false;
    } else {
      this.resetParameters();
    }
    this.updateHelperLines();
  }

  drawTripod(groundPosition: THREE.Vector3) {
    if (!this.scaffold1Placed) {
      this.drawFirstStep(groundPosition);
    } else if (!this.scaffold2Placed) {
      this.drawSecondStep(groundPosition);
    } else if (!this.scaffold3Placed) {
      this.drawThirdStep(groundPosition);
    } else if (!this.lashPositionPlaced) {
      this.drawFourthStep(groundPosition);
    } else {
      this.drawFifthStep();
    }
    this.checkCollisions();
    this.updateHelperLines();
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.scaffold1.setPositionOnGround(groundPosition);
    this.secondGroundPoint = groundPosition
      .clone()
      .sub(
        new THREE.Vector3(
          this.scaffold1.mainRadius + this.scaffold2.mainRadius,
          0,
          0
        )
      );
    this.scaffold2.setPositionOnGround(this.secondGroundPoint);
    this.scaffold3.setPositionOnGround(
      groundPosition
        .clone()
        .add(
          new THREE.Vector3(
            this.scaffold1.mainRadius + this.scaffold3.mainRadius,
            0,
            0
          )
        )
    );
    this.firstGroundPoint = groundPosition;
  }

  drawSecondStep(groundPosition: THREE.Vector3) {
    this.secondGroundPoint = groundPosition;
    const thirdGroundPointOffset = new THREE.Vector3()
      .crossVectors(
        this.firstGroundPoint.clone().sub(this.secondGroundPoint),
        new THREE.Vector3(0, 1, 0)
      )
      .normalize()
      .multiplyScalar(this.scaffold1.mainRadius + this.scaffold3.mainRadius);
    this.thirdGroundPoint = this.firstGroundPoint
      .clone()
      .sub(thirdGroundPointOffset);
    this.lashPositionProjectedOnFloor = this.getCenter(
      this.firstGroundPoint,
      this.secondGroundPoint
    );
    this.calculatePositions();
  }

  drawThirdStep(groundPosition: THREE.Vector3) {
    this.thirdGroundPoint = groundPosition;
    this.lashPositionProjectedOnFloor = this.getCenter(
      this.firstGroundPoint,
      this.secondGroundPoint,
      this.thirdGroundPoint
    );
    this.calculatePositions();
    this.optimisePositions();
  }

  drawFourthStep(groundPosition: THREE.Vector3) {
    this.lashPositionProjectedOnFloor = groundPosition;
    this.calculatePositions();
    this.optimisePositions();
  }

  drawFifthStep() {
    let target = this.viewer.inputHandler.getPointOnLineClosestToCursor(
      this.lashPositionProjectedOnFloor,
      new THREE.Vector3(0, 1, 0)
    );

    this.lashHeight = target.y;

    this.calculatePositions();
    this.optimisePositions();
  }

  calculatePositions() {
    const lashingOffset12 = new THREE.Vector3()
      .crossVectors(this.scaffold1.direction, this.scaffold2.direction)
      .normalize()
      .multiplyScalar(this.scaffold1.mainRadius + this.scaffold2.mainRadius);

    let lashingOffset13 = new THREE.Vector3();
    if (this.scaffold3.isParallelTo(this.scaffold1.direction)) {
      lashingOffset13
        .crossVectors(this.scaffold1.direction, this.scaffold2.direction)
        .normalize()
        .multiplyScalar(this.scaffold1.mainRadius + this.scaffold3.mainRadius);
    } else {
      lashingOffset13
        .crossVectors(this.scaffold1.direction, this.scaffold3.direction)
        .normalize()
        .multiplyScalar(this.scaffold1.mainRadius + this.scaffold3.mainRadius);
    }

    this.lashPosition = new THREE.Vector3(
      this.lashPositionProjectedOnFloor.x,
      this.lashHeight,
      this.lashPositionProjectedOnFloor.z
    );

    const centerScaffold1 = this.lashPosition.clone();
    const centerScaffold2 = this.lashPosition.clone().sub(lashingOffset12);
    const centerScaffold3 = this.lashPosition.clone().add(lashingOffset13);

    this.scaffold1.setPositionBetweenGroundAndPole(
      this.firstGroundPoint,
      centerScaffold1
    );
    this.scaffold2.setPositionBetweenGroundAndPole(
      this.secondGroundPoint,
      centerScaffold2
    );
    this.scaffold3.setPositionBetweenGroundAndPole(
      this.thirdGroundPoint,
      centerScaffold3
    );
  }

  optimisePositions() {
    const direction3 = this.scaffold3.direction.clone();

    const tolerance = 0.001;
    for (let i = 0; i < 1000; i++) {
      let stepSize = 0.0001;
      if (i < 800) stepSize = 0.0003;
      if (i < 600) stepSize = 0.001;
      if (i < 400) stepSize = 0.003;
      if (i < 200) stepSize = 0.01;
      const intitialBadness = this.getScaffold3PositionBadness(
        direction3.clone()
      );
      const gradient = new THREE.Vector3(
        this.getScaffold3PositionBadness(
          direction3.clone().add(new THREE.Vector3(stepSize, 0, 0))
        ) - intitialBadness,
        this.getScaffold3PositionBadness(
          direction3.clone().add(new THREE.Vector3(0, stepSize, 0))
        ) - intitialBadness,
        this.getScaffold3PositionBadness(
          direction3.clone().add(new THREE.Vector3(0, 0, stepSize))
        ) - intitialBadness
      );

      direction3.add(gradient.multiplyScalar(-stepSize));
      if (this.getScaffold3PositionBadness(direction3.clone()) < tolerance) {
        break;
      }
    }

    const lengthScaffold3 = this.thirdGroundPoint
      .clone()
      .sub(this.lashPosition)
      .length();

    const topPositionScaffold3 = this.thirdGroundPoint
      .clone()
      .add(direction3.clone().normalize().multiplyScalar(lengthScaffold3));

    this.scaffold3.setPositionBetweenGroundAndPole(
      this.thirdGroundPoint,
      topPositionScaffold3
    );
  }

  getScaffold3PositionBadness(scaffold3Direction: THREE.Vector3) {
    const dist1 = distanceBetweenLines(
      this.firstGroundPoint,
      this.scaffold1.direction,
      this.thirdGroundPoint,
      scaffold3Direction
    );
    const dist2 = distanceBetweenLines(
      this.secondGroundPoint,
      this.scaffold2.direction,
      this.thirdGroundPoint,
      scaffold3Direction
    );
    return (
      Math.abs(dist1 - this.scaffold1.mainRadius - this.scaffold3.mainRadius) +
      Math.abs(dist2 - this.scaffold2.mainRadius - this.scaffold3.mainRadius)
    );
  }

  getCenter(p1: THREE.Vector3, p2: THREE.Vector3, p3?: THREE.Vector3) {
    return p3
      ? p1.clone().add(p2).add(p3).divideScalar(3.0)
      : p1.clone().add(p2).divideScalar(2.0);
  }

  updateHelperLines() {
    if (this.scaffold3Placed) {
      this.horizontalHelperLines[0].setBetweenPoints([
        this.firstGroundPoint,
        this.lashPositionProjectedOnFloor,
      ]);
      this.horizontalHelperLines[1].setBetweenPoints([
        this.secondGroundPoint,
        this.lashPositionProjectedOnFloor,
      ]);
      this.horizontalHelperLines[2].setBetweenPoints([
        this.thirdGroundPoint,
        this.lashPositionProjectedOnFloor,
      ]);
    } else {
      this.horizontalHelperLines[0].setBetweenPoints([
        this.firstGroundPoint,
        this.secondGroundPoint,
      ]);
      this.horizontalHelperLines[1].setBetweenPoints([
        this.secondGroundPoint,
        this.thirdGroundPoint,
      ]);
      this.horizontalHelperLines[2].setBetweenPoints([
        this.thirdGroundPoint,
        this.firstGroundPoint,
      ]);
    }

    this.verticalHelperLine.setBetweenPoints([
      this.lashPositionProjectedOnFloor,
      this.lashPosition,
    ]);
  }

  checkCollisions() {
    this.tripodIsColliding = false;
    this.viewer.domElement.style.cursor = "default";

    for (const pole of this.viewer.inventory.poles) {
      if (
        this.scaffold1.overlaps(pole) ||
        this.scaffold2.overlaps(pole) ||
        this.scaffold3.overlaps(pole)
      ) {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 0, 0);
        if (this.lashPositionPlaced) {
          this.tripodIsColliding = true;
          this.viewer.domElement.style.cursor = "not-allowed";
        }
      } else {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 1, 1);
      }
    }
  }
}

const distanceBetweenLines = (
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
