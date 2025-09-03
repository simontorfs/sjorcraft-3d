import { Pole } from "../objects/pole";
import { Scaffold } from "../objects/scaffold";
import * as THREE from "three";
import { Viewer } from "../viewer";
import { SquareLashing } from "../objects/lashings/squareLashing";
import { HelperLine } from "../objects/helperLine";
import { Tool } from "./tool";

export class PoleTool extends Tool {
  activeScaffold: Scaffold;
  hoveringGround: boolean;
  fixedLashing: SquareLashing | undefined;
  newLashing: SquareLashing | undefined;
  lastPole: Pole | undefined;
  currentSnapHeight: number | undefined;
  snapHelperLine: HelperLine;
  activeScaffoldIsColliding: boolean = false;

  constructor(viewer: Viewer) {
    super(viewer);
    this.activeScaffold = new Scaffold();
    this.hoveringGround = false;
    this.snapHelperLine = new HelperLine();
    this.snapHelperLine.visible = false;
    this.viewer.scene.add(this.snapHelperLine);
  }

  activate() {
    if (this.active) return;
    this.activeScaffold = new Scaffold();
    this.activeScaffold.setPositions(new THREE.Vector3(0, 200, 0));
    this.activeScaffold.addToScene(this.viewer.scene);
    this.active = true;
  }

  deactivate() {
    this.activeScaffold.removeFromScene(this.viewer.scene);
    this.active = false;
    if (this.fixedLashing)
      this.viewer.inventory.removeLashings([this.fixedLashing]);
    if (this.newLashing)
      this.viewer.inventory.removeLashings([this.newLashing]);
    this.fixedLashing = undefined;
    this.newLashing = undefined;
    this.lastPole = undefined;

    this.viewer.inventory.resetAllColors();
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
        lashing.centerFixedPole.distanceTo(
          this.newLashing?.anchorPoint || new THREE.Vector3() // Typescript complains newLashing could be undefined, even though WE LITERALLY JUST CHECKED THAT IT'S NOT
        ) < 5
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
      this.commitLashings();
      const polesToAdd = this.activeScaffold.getVisiblePoles();
      this.viewer.inventory.addPoles(polesToAdd);

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
    if (this.fixedLashing) {
      this.fixedLashing.relashToRightScaffoldPole(this.activeScaffold);
      this.viewer.inventory.addLashings([this.fixedLashing]);
    }
    if (this.newLashing) {
      this.newLashing.relashToRightScaffoldPole(this.activeScaffold);
      this.viewer.inventory.addLashings([this.newLashing]);
    }
    this.fixedLashing = undefined;
    this.newLashing = undefined;

    this.viewer.inventory.addScaffoldLashings(
      this.activeScaffold.getVisibleScaffoldLashings()
    );
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
