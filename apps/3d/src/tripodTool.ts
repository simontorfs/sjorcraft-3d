import * as THREE from "three";
import { Scaffold } from "./scaffold";
import { Viewer } from "./viewer";
import { HelperLine } from "./helperLine";

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

  boundaryHelperLine12: HelperLine = new HelperLine();
  boundaryHelperLine23: HelperLine = new HelperLine();
  boundaryHelperLine31: HelperLine = new HelperLine();

  verticalHelperLine: HelperLine = new HelperLine();
  helperPlane: THREE.Plane = new THREE.Plane();

  tripodIsColliding: boolean = false;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  activate() {
    this.active = true;
    this.scaffold1.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold2.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold2.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold1.addToScene(this.viewer.scene);
    this.scaffold2.addToScene(this.viewer.scene);
    this.scaffold3.addToScene(this.viewer.scene);
  }

  deactivate() {
    this.active = false;
    this.scaffold1.removeFromScene(this.viewer.scene);
    this.scaffold2.removeFromScene(this.viewer.scene);
    this.scaffold3.removeFromScene(this.viewer.scene);
    this.removeHorizontalHelperLines();
    this.removeVerticalHelperLine();
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
    } else if (!this.scaffold2Placed) {
      this.scaffold2Placed = true;
    } else if (!this.scaffold3Placed) {
      this.scaffold3Placed = true;
      this.addHorizontalHelperLines();
    } else if (!this.lashPositionPlaced) {
      this.lashPositionPlaced = true;
      this.removeHorizontalHelperLines();
      this.addVerticalHelperLine();
    } else {
      if (this.tripodIsColliding) return;
      this.removeVerticalHelperLine();
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
  }

  rightClick() {
    if (!this.active) return;

    if (this.lashPositionPlaced) {
      this.lashPositionPlaced = false;
      this.removeVerticalHelperLine();
      this.addHorizontalHelperLines();
    } else if (this.scaffold3Placed) {
      this.scaffold3Placed = false;
      this.removeHorizontalHelperLines();
    } else if (this.scaffold2Placed) {
      this.scaffold2Placed = false;
    } else if (this.scaffold1Placed) {
      this.scaffold1Placed = false;
    } else {
      this.resetParameters();
    }
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
      this.drawFifthStep(groundPosition);
    }
    this.checkCollisions();
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
    this.scaffold3.setPositionOnGround(
      groundPosition
        .clone()
        .sub(
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

  drawFifthStep(groundPosition: THREE.Vector3) {
    this.setHelperPlane();
    const lineOfSightToMouse = new THREE.Line3(
      this.viewer.camera.position,
      groundPosition
    );
    let target: THREE.Vector3 = new THREE.Vector3();
    this.helperPlane.intersectLine(lineOfSightToMouse, target);
    this.lashHeight = target.y;

    this.calculatePositions();
    this.optimisePositions();
    this.updateVerticalHelperLine();
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

  addHorizontalHelperLines() {
    this.boundaryHelperLine12.setBetweenPoints([
      this.firstGroundPoint,
      this.secondGroundPoint,
    ]);
    this.viewer.scene.add(this.boundaryHelperLine12);
    this.boundaryHelperLine23.setBetweenPoints([
      this.secondGroundPoint,
      this.thirdGroundPoint,
    ]);
    this.viewer.scene.add(this.boundaryHelperLine23);
    this.boundaryHelperLine31.setBetweenPoints([
      this.thirdGroundPoint,
      this.firstGroundPoint,
    ]);
    this.viewer.scene.add(this.boundaryHelperLine31);
  }

  removeHorizontalHelperLines() {
    this.viewer.scene.remove(this.boundaryHelperLine12);
    this.viewer.scene.remove(this.boundaryHelperLine23);
    this.viewer.scene.remove(this.boundaryHelperLine31);
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

  setHelperPlane() {
    const lineOfSightToLashing = this.viewer.camera.position
      .clone()
      .sub(this.lashPosition)
      .normalize();
    this.helperPlane.setFromNormalAndCoplanarPoint(
      lineOfSightToLashing,
      this.lashPosition
    );
  }

  checkCollisions() {
    this.tripodIsColliding = false;
    document.body.style.cursor = "default";

    for (const pole of this.viewer.poleInventory.poles) {
      if (
        this.scaffold1.overlaps(pole) ||
        this.scaffold2.overlaps(pole) ||
        this.scaffold3.overlaps(pole)
      ) {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 0, 0);
        if (this.lashPositionPlaced) {
          this.tripodIsColliding = true;
          document.body.style.cursor = "not-allowed";
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
