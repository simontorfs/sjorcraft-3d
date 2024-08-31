import { Pole } from "./pole";
import { Scaffold } from "./scaffold";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { Lashing } from "./lashing";
import { HelperLine } from "./helperLine";

export class PoleTool {
  active: boolean;
  activeScaffold: Scaffold;
  viewer: Viewer;
  hoveringGround: boolean;
  fixedLashing: Lashing | undefined;
  newLashing: Lashing | undefined;
  lastPole: Pole | undefined;
  currentSnapHeight: number | undefined;
  snapHelperLine: HelperLine;
  activeScaffoldIsColliding: boolean = false;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = false;
    this.activeScaffold = new Scaffold();
    this.hoveringGround = false;
    this.snapHelperLine = new HelperLine();
    this.snapHelperLine.visible = false;
    this.viewer.scene.add(this.snapHelperLine);

    // load poles from local storage if available else add demo poles
    if (localStorage.getItem("poles") !== null) {
      this.viewer.saveTool.loadPolesFromLocalStorage();
    } else if (this.viewer.inventory.poles.length === 0) {
      this.addDemoPoles();
    }
    if (localStorage.getItem("lashes") !== null) {
      this.viewer.saveTool.loadLashingsFromLocalStorage();
    }
  }

  addDemoPoles() {
    const demoPole1 = new Pole();
    this.viewer.scene.add(demoPole1);
    this.viewer.inventory.addPole(demoPole1);
    demoPole1.position.x = -0.07;
    demoPole1.position.y = 1.74;
    demoPole1.position.z = 0.1;
    demoPole1.setDirection(new THREE.Vector3(0, 1.8, 1));
    demoPole1.name = "demoPole1";

    const demoPole2 = new Pole();
    this.viewer.scene.add(demoPole2);
    this.viewer.inventory.addPole(demoPole2);
    demoPole2.position.x = 0.9;
    demoPole2.position.y = 1.74;
    demoPole2.position.z = 0.93;
    demoPole2.setDirection(new THREE.Vector3(-1, 1.8, 0));
    demoPole2.name = "demoPole2";

    const demoPole3 = new Pole();
    this.viewer.scene.add(demoPole3);
    this.viewer.inventory.addPole(demoPole3);
    demoPole3.position.x = 0.07;
    demoPole3.position.y = 1.74;
    demoPole3.position.z = 1.9;
    demoPole3.setDirection(new THREE.Vector3(0, 1.8, -1));
    demoPole3.name = "demoPole3";

    const demoPole4 = new Pole();
    this.viewer.scene.add(demoPole4);
    this.viewer.inventory.addPole(demoPole4);
    demoPole4.position.x = -0.9;
    demoPole4.position.y = 1.74;
    demoPole4.position.z = 1.07;
    demoPole4.setDirection(new THREE.Vector3(1, 1.8, 0));
    demoPole4.name = "demoPole4";
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
      this.viewer.inventory.removeLashing(this.fixedLashing);
    if (this.newLashing) this.viewer.inventory.removeLashing(this.newLashing);
    this.fixedLashing = undefined;
    this.newLashing = undefined;
    this.lastPole = undefined;

    this.viewer.inventory.resetAllColors();
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
      this.newLashing = new Lashing();
    }
    this.newLashing.setProperties(
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
        lashing.anchorPoint.distanceTo(
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

  leftClick() {
    if (this.activeScaffoldIsColliding) return;
    if (this.fixedLashing || this.hoveringGround) {
      this.commitLashings();
      this.activeScaffold.addToViewer(this.viewer);
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
      this.viewer.inventory.addLashing(this.fixedLashing);
    }
    if (this.newLashing) {
      this.viewer.inventory.addLashing(this.newLashing);
    }
    this.fixedLashing = undefined;
    this.newLashing = undefined;
  }

  rightClick() {
    this.activeScaffold.reset();

    if (this.fixedLashing) {
      this.viewer.scene.remove(this.fixedLashing);
    }
    this.newLashing = undefined;
    this.fixedLashing = undefined;
  }

  checkCollisions(blockPlacement: boolean) {
    this.activeScaffoldIsColliding = false;
    document.body.style.cursor = "default";

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
          document.body.style.cursor = "not-allowed";
        }
      } else {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 1, 1);
      }
    }
  }
}
