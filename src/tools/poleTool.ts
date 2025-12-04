import { Pole } from "../objects/pole";
import { Scaffold } from "../objects/scaffold";
import * as THREE from "three";
import { Viewer } from "../viewer";
import { SquareLashing } from "../objects/lashings/squareLashing";
import {
  AngleLabel,
  AngleMarker,
  DistanceHelperLine,
  HelperLine,
} from "../objects/helperLine";
import { Tool } from "./tool";

export class PoleTool extends Tool {
  activeScaffold: Scaffold;
  hoveringGround: boolean;
  fixedLashing: SquareLashing | undefined;
  newLashing: SquareLashing | undefined;
  lastPole: Pole | undefined;
  currentSnapHeight: number | undefined;

  activeScaffoldIsColliding: boolean = false;

  snapHelperLine: HelperLine = new HelperLine();
  fixedPoleHelperLine: DistanceHelperLine = new DistanceHelperLine();
  angleMarker1: AngleMarker = new AngleMarker();
  angleMarker2: AngleMarker = new AngleMarker();
  poleAngle: AngleLabel = new AngleLabel();

  constructor(viewer: Viewer) {
    super(viewer);
    this.activeScaffold = new Scaffold();
    this.hoveringGround = false;

    this.snapHelperLine.visible = false;
    this.setHelpers();
  }

  activate() {
    if (this.active) return;
    this.activeScaffold = new Scaffold();
    this.activeScaffold.setPositions(new THREE.Vector3(0, 200, 0));
    this.activeScaffold.addToScene(this.viewer.scene);
    this.active = true;

    this.viewer.scene.add(this.snapHelperLine);
    this.viewer.scene.add(this.fixedPoleHelperLine);
    this.viewer.scene.add(this.angleMarker1);
    this.viewer.scene.add(this.angleMarker2);
    this.viewer.scene.add(this.poleAngle);
  }

  deactivate() {
    this.activeScaffold.removeFromScene(this.viewer.scene);
    this.active = false;
    if (this.fixedLashing)
      this.viewer.inventory.removeSquareLashing(this.fixedLashing);
    if (this.newLashing)
      this.viewer.inventory.removeSquareLashing(this.newLashing);
    this.fixedLashing = undefined;
    this.newLashing = undefined;
    this.lastPole = undefined;

    this.viewer.inventory.resetAllColors();

    this.setHelpers();
    this.viewer.scene.remove(this.snapHelperLine);
    this.viewer.scene.remove(this.fixedPoleHelperLine);
    this.viewer.scene.remove(this.angleMarker1);
    this.viewer.scene.remove(this.angleMarker2);
    this.viewer.scene.remove(this.poleAngle);
  }

  onMouseMove() {
    const poleIntersect = this.viewer.inputHandler.getPoleIntersect();

    if (poleIntersect) {
      const hoveredPole = poleIntersect.pole;

      this.drawPoleWhileHoveringOtherPole(
        poleIntersect.point,
        hoveredPole,
        poleIntersect.normal
      );
    } else {
      const groundPosition =
        this.viewer.inputHandler.getHoveredGroundPosition();
      if (groundPosition) this.drawPoleWhileHoveringGound(groundPosition);
    }
    this.setHelpers();
  }

  setHelpers() {
    this.fixedPoleHelperLine.visible = false;
    this.poleAngle.visible = false;
    this.angleMarker1.visible = false;
    this.angleMarker2.visible = false;
    if (this.newLashing) {
      const fixedPole = this.newLashing.fixedPole;
      const projectedPosition = fixedPole.getProjectedPoint(
        this.newLashing.position
      );
      this.fixedPoleHelperLine.setBetweenPoints([
        fixedPole.getTop(),
        projectedPosition,
        fixedPole.getBottom(),
      ]);
      this.fixedPoleHelperLine.visible = true;
      if (this.fixedLashing) {
        this.angleMarker1.setOnLashing(this.newLashing);
        this.angleMarker1.visible = true;
      }
    }

    if (this.fixedLashing) {
      this.angleMarker2.setOnLashing(this.fixedLashing);
      this.angleMarker2.visible = true;
      this.poleAngle.setOnPole(this.activeScaffold.mainPole);
      this.poleAngle.visible = true;
    }
  }

  drawPoleWhileHoveringGound(groundPosition: THREE.Vector3) {
    if (this.newLashing) this.viewer.scene.remove(this.newLashing);
    this.newLashing = undefined;
    this.hoveringGround = true;
    this.snapHelperLine.visible = false;

    this.snapToGrid(groundPosition);

    if (this.fixedLashing) {
      this.placePoleBetweenOneLashingAndGround(groundPosition);
    } else {
      this.placePoleOnGround(groundPosition);
    }
    this.checkCollisions(true);
  }

  drawPoleWhileHoveringOtherPole(
    position: THREE.Vector3,
    hoveredPole: Pole,
    normal: THREE.Vector3
  ) {
    this.hoveringGround = false;

    if (!this.newLashing) {
      this.newLashing = new SquareLashing();
    }
    this.newLashing.setPropertiesFromAnchorPoint(
      hoveredPole,
      this.activeScaffold.mainPole,
      position,
      normal
    );
    this.viewer.scene.add(this.newLashing);

    if (this.fixedLashing) {
      if (this.fixedLashing.fixedPole === hoveredPole) return;
      this.placePoleBetweenTwoLashings();
      this.checkCollisions(true);
    } else {
      this.placePoleOnOneLashing();
      this.checkCollisions(false);
    }
  }

  placePoleBetweenTwoLashings() {
    if (!this.fixedLashing || !this.newLashing) return;
    // Step 1: Set naive pole position based on the anchorPoints
    this.activeScaffold.setPositionBetweenTwoPoles(
      this.fixedLashing.anchorPoint,
      this.newLashing.anchorPoint
    );
    // Step 2: Use the pole's naive orientation to estimate the center coordinates of the lashings
    this.fixedLashing.calculatePositions();
    this.newLashing.calculatePositions();
    this.snapToHeight();
    // Step 3: Set the pole position with the estimated center coordinates
    this.activeScaffold.setPositionBetweenTwoPoles(
      this.fixedLashing.centerLoosePole,
      this.newLashing.centerLoosePole
    );
    this.fixedLashing.updateMesh();
    this.newLashing.updateMesh();
  }

  placePoleOnOneLashing() {
    if (!this.newLashing) return;
    const targetOrientationVector = new THREE.Vector3().crossVectors(
      this.newLashing.anchorPointNormal,
      this.newLashing.fixedPole.direction
    );

    this.activeScaffold.setDirection(targetOrientationVector);
    this.snapToHeight();

    this.activeScaffold.mainPole.position.set(
      this.newLashing.centerLoosePole.x,
      this.newLashing.centerLoosePole.y,
      this.newLashing.centerLoosePole.z
    );
    this.newLashing.updateMesh();
  }

  placePoleBetweenOneLashingAndGround(groundPosition: THREE.Vector3) {
    if (!this.fixedLashing) return;

    // Step 1: Set naive pole position based on the anchorPoint
    this.activeScaffold.setPositionBetweenGroundAndPole(
      groundPosition,
      this.fixedLashing.anchorPoint
    );
    // Step 2: Use the pole's naive orientation to estimate the center coordinates of the lashing
    this.fixedLashing.calculatePositions();
    // Step 3: Set the pole position with the estimated center coordinates
    this.activeScaffold.setPositionBetweenGroundAndPole(
      groundPosition,
      this.fixedLashing.centerLoosePole
    );
    this.fixedLashing.updateMesh();
  }

  placePoleOnGround(groundPosition: THREE.Vector3) {
    this.activeScaffold.setPositionOnGround(groundPosition);
  }

  snapToHeight() {
    if (!this.newLashing) return;

    this.currentSnapHeight = undefined;

    const snapLashings = this.viewer.inventory.lashings.filter(
      (lashing) =>
        lashing.fixedPole.isVertical() &&
        lashing.centerFixedPole.distanceTo(this.newLashing!.anchorPoint) < 5
    );
    if (this.fixedLashing) snapLashings.push(this.fixedLashing);

    for (const snapLashing of snapLashings) {
      const snapped = this.newLashing.snapLoosePole(
        snapLashing.centerLoosePole.y
      );
      if (snapped) {
        this.currentSnapHeight = snapLashing.centerLoosePole.y;
        this.snapHelperLine.setBetweenPoints([
          snapLashing.centerLoosePole,
          this.newLashing.centerLoosePole,
        ]);
        this.snapHelperLine.visible = true;
        return;
      }
    }
    this.snapHelperLine.visible = false;
  }

  snapToGrid(position: THREE.Vector3) {
    // Check if position x or z is close to a whole number.
    // If somebody knows a shorter formula, be my guest.
    if (Math.abs(Math.abs((position.x + 0.5) % 1) - 0.5) < 0.05) {
      position.x = Math.round(position.x);
    }
    if (Math.abs(Math.abs((position.z + 0.5) % 1) - 0.5) < 0.05) {
      position.z = Math.round(position.z);
    }
  }

  onLeftClick() {
    if (this.activeScaffoldIsColliding) return;
    if (this.fixedLashing || this.hoveringGround) {
      const { lashingsToAdd, scaffoldLashingsToAdd } = this.commitLashings();
      const polesToAdd = this.activeScaffold.getVisiblePoles();
      this.viewer.inventory.addItems({
        poles: polesToAdd,
        squareLashings: lashingsToAdd,
        scaffoldLashings: scaffoldLashingsToAdd,
      });

      this.lastPole = this.activeScaffold.mainPole;

      this.activeScaffold = new Scaffold();
      this.activeScaffold.setPositions(new THREE.Vector3(0, 200, 0));
      this.activeScaffold.addToScene(this.viewer.scene);
    } else {
      if (this.newLashing) {
        this.newLashing.fixedHeight = this.currentSnapHeight;
        this.fixedLashing = this.newLashing;
        this.newLashing = undefined;
      }
    }
  }

  commitLashings() {
    const lashingsToAdd: SquareLashing[] = [];
    if (this.fixedLashing) {
      this.fixedLashing.relashToRightScaffoldPole(this.activeScaffold);
      lashingsToAdd.push(this.fixedLashing);
    }
    if (this.newLashing) {
      this.newLashing.relashToRightScaffoldPole(this.activeScaffold);
      lashingsToAdd.push(this.newLashing);
    }
    this.fixedLashing = undefined;
    this.newLashing = undefined;

    const scaffoldLashingsToAdd =
      this.activeScaffold.getVisibleScaffoldLashings();

    return { lashingsToAdd, scaffoldLashingsToAdd };
  }

  onRightClick() {
    this.activeScaffold.reset();

    if (this.fixedLashing) {
      this.viewer.scene.remove(this.fixedLashing);
    }
    if (this.newLashing) {
      this.viewer.scene.remove(this.newLashing);
    }
    this.newLashing = undefined;
    this.fixedLashing = undefined;
  }

  checkCollisions(blockPlacement: boolean) {
    this.activeScaffoldIsColliding = false;
    this.viewer.domElement.style.cursor = "default";

    for (const pole of this.viewer.inventory.poles) {
      if (
        this.activeScaffold.overlaps(pole) &&
        pole !== this.fixedLashing?.fixedPole &&
        pole !== this.newLashing?.fixedPole
      ) {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 0, 0);
        if (blockPlacement) {
          this.activeScaffoldIsColliding = true;
          this.viewer.domElement.style.cursor = "not-allowed";
        }
      } else {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 1, 1);
      }
    }
  }
}
