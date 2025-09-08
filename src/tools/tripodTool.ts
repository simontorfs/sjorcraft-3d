import * as THREE from "three";
import { Scaffold } from "../objects/scaffold";
import { Viewer } from "../viewer";
import { DistanceHelperLine } from "../objects/helperLine";
import { Tool } from "./tool";
import { TripodLashing } from "../objects/lashings/tripodLashing";

export class TripodTool extends Tool {
  scaffold1: Scaffold = new Scaffold();
  scaffold2: Scaffold = new Scaffold();
  scaffold3: Scaffold = new Scaffold();
  lashing: TripodLashing = new TripodLashing(
    this.scaffold2,
    this.scaffold1,
    this.scaffold3
  );

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
    super(viewer);

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
    this.resetParameters();
    this.scaffold1.addToScene(this.viewer.scene);
    this.scaffold2.addToScene(this.viewer.scene);
    this.scaffold3.addToScene(this.viewer.scene);
    this.viewer.scene.add(this.lashing);
  }

  deactivate() {
    this.active = false;
    this.scaffold1.removeFromScene(this.viewer.scene);
    this.scaffold2.removeFromScene(this.viewer.scene);
    this.scaffold3.removeFromScene(this.viewer.scene);
    this.viewer.scene.remove(this.lashing);
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
    this.scaffold1.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold2.setPositions(new THREE.Vector3(0, 200, 0));
    this.scaffold3.setPositions(new THREE.Vector3(0, 200, 0));
    this.lashing.position.set(0, 200, 0);
  }

  onLeftClick() {
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
      const polesToAdd = [
        ...this.scaffold1.getVisiblePoles(),
        ...this.scaffold2.getVisiblePoles(),
        ...this.scaffold3.getVisiblePoles(),
      ];
      this.viewer.inventory.addPoles(polesToAdd);
      const scaffoldLashingsToAdd = [
        ...this.scaffold1.getVisibleScaffoldLashings(),
        ...this.scaffold2.getVisibleScaffoldLashings(),
        ...this.scaffold3.getVisibleScaffoldLashings(),
      ];
      this.viewer.inventory.addScaffoldLashings(scaffoldLashingsToAdd);
      this.scaffold1 = new Scaffold();
      this.scaffold2 = new Scaffold();
      this.scaffold3 = new Scaffold();
      this.scaffold1.addToScene(this.viewer.scene);
      this.scaffold2.addToScene(this.viewer.scene);
      this.scaffold3.addToScene(this.viewer.scene);
      this.viewer.inventory.addTripodLashings([this.lashing]);
      this.lashing = new TripodLashing(
        this.scaffold2,
        this.scaffold1,
        this.scaffold3
      );
      this.viewer.scene.add(this.lashing);
      this.resetParameters();
    }
    this.updateHelperLines();
  }

  onRightClick() {
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

  onMouseMove() {
    const groundPosition = this.viewer.inputHandler.getHoveredGroundPosition();
    this.drawTripod(groundPosition);
  }

  drawTripod(groundPosition: THREE.Vector3 | null) {
    if (!this.scaffold1Placed) {
      if (groundPosition) this.drawFirstStep(groundPosition);
    } else if (!this.scaffold2Placed) {
      if (groundPosition) this.drawSecondStep(groundPosition);
    } else if (!this.scaffold3Placed) {
      if (groundPosition) this.drawThirdStep(groundPosition);
    } else if (!this.lashPositionPlaced) {
      if (groundPosition) this.drawFourthStep(groundPosition);
    } else {
      this.drawFifthStep();
    }
    this.checkCollisions();
    this.updateHelperLines();
    this.lashing.update();
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
    let direction3 = this.scaffold3.direction.clone();
    this.scaffold3.setPositionOnGround(this.thirdGroundPoint);

    const tolerance = 0.0001;
    const maxIterations = 1000;

    for (let i = 0; i < maxIterations; i++) {
      const F = this.getErrorVector(direction3);
      if (F.length() < tolerance) {
        break;
      }
      const J = this.getJacobianMatrix(direction3);
      const delta_d3 = this.solveLinearSystem(J, F.negate());
      direction3.add(delta_d3).normalize();
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

  getErrorVector(scaffold3Direction: THREE.Vector3) {
    const f1 =
      distanceBetweenLines(
        this.firstGroundPoint,
        this.scaffold1.direction,
        this.thirdGroundPoint,
        scaffold3Direction
      ) -
      (this.scaffold1.mainRadius + this.scaffold3.mainRadius);

    const f2 =
      distanceBetweenLines(
        this.secondGroundPoint,
        this.scaffold2.direction,
        this.thirdGroundPoint,
        scaffold3Direction
      ) -
      (this.scaffold2.mainRadius + this.scaffold3.mainRadius);
    const f3 = scaffold3Direction.lengthSq() - 1;

    return new THREE.Vector3(f1, f2, f3);
  }

  getJacobianMatrix(d3: THREE.Vector3) {
    const d1 = this.scaffold1.direction;
    const d2 = this.scaffold2.direction;
    const a1 = this.firstGroundPoint;
    const a2 = this.secondGroundPoint;
    const a3 = this.thirdGroundPoint;
    const row1 = this.getDerivedRow(d1, d3, a1, a3);
    const row2 = this.getDerivedRow(d2, d3, a2, a3);
    const row3 = new THREE.Vector3(2 * d3.x, 2 * d3.y, 2 * d3.z);
    const J = new THREE.Matrix3().set(
      row1.x,
      row2.x,
      row3.x,
      row1.y,
      row2.y,
      row3.y,
      row1.z,
      row2.z,
      row3.z
    );
    return J;
  }

  getDerivedRow(
    di: THREE.Vector3,
    dj: THREE.Vector3,
    ai: THREE.Vector3,
    aj: THREE.Vector3
  ) {
    const delta_a = aj.clone().sub(ai);
    const d_cross = di.clone().cross(dj);
    const M_sq = d_cross.lengthSq();

    if (M_sq < 1e-9) {
      return new THREE.Vector3(0, 0, 0);
    }
    const M = Math.sqrt(M_sq);
    const N = delta_a.dot(d_cross);

    const i = new THREE.Vector3(1, 0, 0);
    const j = new THREE.Vector3(0, 1, 0);
    const k = new THREE.Vector3(0, 0, 1);
    const dN_d3x = delta_a.clone().dot(i.cross(di));
    const dN_d3y = delta_a.clone().dot(j.cross(di));
    const dN_d3z = delta_a.clone().dot(k.cross(di));

    const dM_d3x = d_cross.clone().dot(i.cross(di)) / M;
    const dM_d3y = d_cross.clone().dot(j.cross(di)) / M;
    const dM_d3z = d_cross.clone().dot(k.cross(di)) / M;

    const df_d3x = (dN_d3x * M - N * dM_d3x) / M_sq;
    const df_d3y = (dN_d3y * M - N * dM_d3y) / M_sq;
    const df_d3z = (dN_d3z * M - N * dM_d3z) / M_sq;

    return new THREE.Vector3(df_d3x, df_d3y, df_d3z);
  }

  solveLinearSystem(J: THREE.Matrix3, F: THREE.Vector3) {
    const m = J.elements;
    const Fx = F.x;
    const Fy = F.y;
    const Fz = F.z;

    const D =
      m[0] * (m[4] * m[8] - m[5] * m[7]) -
      m[1] * (m[3] * m[8] - m[5] * m[6]) +
      m[2] * (m[3] * m[7] - m[4] * m[6]);

    if (Math.abs(D) < 1e-9) {
      return new THREE.Vector3(0, 0, 0);
    }

    const Dx =
      Fx * (m[4] * m[8] - m[5] * m[7]) -
      m[1] * (Fy * m[8] - m[5] * Fz) +
      m[2] * (Fy * m[7] - m[4] * Fz);

    const Dy =
      m[0] * (Fy * m[8] - m[5] * Fz) -
      Fx * (m[3] * m[8] - m[5] * m[6]) +
      m[2] * (m[3] * Fz - Fy * m[6]);

    const Dz =
      m[0] * (m[4] * Fz - m[5] * Fy) -
      m[1] * (m[3] * Fz - Fy * m[6]) +
      Fx * (m[3] * m[7] - m[4] * m[6]);

    return new THREE.Vector3(Dx / D, Dy / D, Dz / D);
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
