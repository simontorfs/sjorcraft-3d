import * as THREE from "three";
import { Pole } from "./pole";
import { Viewer } from "./viewer";
import { HelperLine } from "./helperLine";

export class TripodTool {
  active: boolean = false;
  viewer: Viewer;

  pole1: Pole = new Pole();
  pole2: Pole = new Pole();
  pole3: Pole = new Pole();

  pole1Placed: boolean = false;
  pole2Placed: boolean = false;
  pole3Placed: boolean = false;
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
    this.pole1.position.y = 200;
    this.pole2.position.y = 200;
    this.pole3.position.y = 200;
    this.viewer.scene.add(this.pole1);
    this.viewer.scene.add(this.pole2);
    this.viewer.scene.add(this.pole3);
  }

  deactivate() {
    this.active = false;
    this.viewer.scene.remove(this.pole1);
    this.viewer.scene.remove(this.pole2);
    this.viewer.scene.remove(this.pole3);
    this.removeHorizontalHelperLines();
    this.removeVerticalHelperLine();
    this.resetParameters();
  }

  resetParameters() {
    this.pole1Placed = false;
    this.pole2Placed = false;
    this.pole3Placed = false;
    this.lashPositionPlaced = false;
    this.lashHeight = this.defaultLashHeight;
  }

  leftClick() {
    if (!this.pole1Placed) {
      this.pole1Placed = true;
    } else if (!this.pole2Placed) {
      this.pole2Placed = true;
    } else if (!this.pole3Placed) {
      this.pole3Placed = true;
      this.addHorizontalHelperLines();
    } else if (!this.lashPositionPlaced) {
      this.lashPositionPlaced = true;
      this.removeHorizontalHelperLines();
      this.addVerticalHelperLine();
    } else {
      if (this.tripodIsColliding) return;
      this.removeVerticalHelperLine();
      this.viewer.poleInventory.addPole(this.pole1);
      this.viewer.poleInventory.addPole(this.pole2);
      this.viewer.poleInventory.addPole(this.pole3);
      this.pole1 = new Pole();
      this.pole2 = new Pole();
      this.pole3 = new Pole();
      this.viewer.scene.add(this.pole1);
      this.viewer.scene.add(this.pole2);
      this.viewer.scene.add(this.pole3);
      this.resetParameters();
    }
  }

  rightClick() {
    if (!this.active) return;

    if (this.lashPositionPlaced) {
      this.lashPositionPlaced = false;
      this.removeVerticalHelperLine();
      this.addHorizontalHelperLines();
    } else if (this.pole3Placed) {
      this.pole3Placed = false;
      this.removeHorizontalHelperLines();
    } else if (this.pole2Placed) {
      this.pole2Placed = false;
    } else if (this.pole1Placed) {
      this.pole1Placed = false;
    } else {
      this.resetParameters();
    }
  }

  drawTripod(groundPosition: THREE.Vector3) {
    if (!this.pole1Placed) {
      this.drawFirstStep(groundPosition);
    } else if (!this.pole2Placed) {
      this.drawSecondStep(groundPosition);
    } else if (!this.pole3Placed) {
      this.drawThirdStep(groundPosition);
    } else if (!this.lashPositionPlaced) {
      this.drawFourthStep(groundPosition);
    } else {
      this.drawFifthStep(groundPosition);
    }
    this.checkCollisions();
  }

  drawFirstStep(groundPosition: THREE.Vector3) {
    this.pole1.setPositionOnGround(groundPosition);
    this.pole2.setPositionOnGround(
      groundPosition
        .clone()
        .add(new THREE.Vector3(this.pole1.radius + this.pole2.radius, 0, 0))
    );
    this.pole3.setPositionOnGround(
      groundPosition
        .clone()
        .sub(new THREE.Vector3(this.pole1.radius + this.pole3.radius, 0, 0))
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
      .multiplyScalar(this.pole1.radius + this.pole3.radius);
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
      .crossVectors(this.pole1.direction, this.pole2.direction)
      .normalize()
      .multiplyScalar(this.pole1.radius + this.pole2.radius);

    let lashingOffset13 = new THREE.Vector3();
    if (this.pole3.isParallelTo(this.pole1.direction)) {
      lashingOffset13
        .crossVectors(this.pole1.direction, this.pole2.direction)
        .normalize()
        .multiplyScalar(this.pole1.radius + this.pole3.radius);
    } else {
      lashingOffset13
        .crossVectors(this.pole1.direction, this.pole3.direction)
        .normalize()
        .multiplyScalar(this.pole1.radius + this.pole3.radius);
    }

    this.lashPosition = new THREE.Vector3(
      this.lashPositionProjectedOnFloor.x,
      this.lashHeight,
      this.lashPositionProjectedOnFloor.z
    );

    const centerPole1 = this.lashPosition.clone();
    const centerPole2 = this.lashPosition.clone().sub(lashingOffset12);
    const centerPole3 = this.lashPosition.clone().add(lashingOffset13);

    this.pole1.setPositionBetweenGroundAndPole(
      this.firstGroundPoint,
      centerPole1
    );
    this.pole2.setPositionBetweenGroundAndPole(
      this.secondGroundPoint,
      centerPole2
    );
    this.pole3.setPositionBetweenGroundAndPole(
      this.thirdGroundPoint,
      centerPole3
    );
  }

  optimisePositions() {
    const direction3 = this.pole3.direction.clone();

    const tolerance = 0.001;
    for (let i = 0; i < 1000; i++) {
      let stepSize = 0.0001;
      if (i < 800) stepSize = 0.0003;
      if (i < 600) stepSize = 0.001;
      if (i < 400) stepSize = 0.003;
      if (i < 200) stepSize = 0.01;
      const intitialBadness = this.getPole3PositionBadness(direction3.clone());
      const gradient = new THREE.Vector3(
        this.getPole3PositionBadness(
          direction3.clone().add(new THREE.Vector3(stepSize, 0, 0))
        ) - intitialBadness,
        this.getPole3PositionBadness(
          direction3.clone().add(new THREE.Vector3(0, stepSize, 0))
        ) - intitialBadness,
        this.getPole3PositionBadness(
          direction3.clone().add(new THREE.Vector3(0, 0, stepSize))
        ) - intitialBadness
      );

      direction3.add(gradient.multiplyScalar(-stepSize));
      if (this.getPole3PositionBadness(direction3.clone()) < tolerance) {
        break;
      }
    }

    const lengthPole3 = this.thirdGroundPoint
      .clone()
      .sub(this.lashPosition)
      .length();

    const topPositionPole3 = this.thirdGroundPoint
      .clone()
      .add(direction3.clone().normalize().multiplyScalar(lengthPole3));

    this.pole3.setPositionBetweenGroundAndPole(
      this.thirdGroundPoint,
      topPositionPole3
    );
  }

  getPole3PositionBadness(pole3Direction: THREE.Vector3) {
    const dist1 = distanceBetweenLines(
      this.firstGroundPoint,
      this.pole1.direction,
      this.thirdGroundPoint,
      pole3Direction
    );
    const dist2 = distanceBetweenLines(
      this.secondGroundPoint,
      this.pole2.direction,
      this.thirdGroundPoint,
      pole3Direction
    );
    return (
      Math.abs(dist1 - this.pole1.radius - this.pole3.radius) +
      Math.abs(dist2 - this.pole2.radius - this.pole3.radius)
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
        this.pole1.overlaps(pole) ||
        this.pole2.overlaps(pole) ||
        this.pole3.overlaps(pole)
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
