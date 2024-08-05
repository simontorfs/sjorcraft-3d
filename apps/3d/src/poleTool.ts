import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { Lashing } from "./lashing";
import { HelperLine } from "./helperLine";

export class PoleTool {
  active: boolean;
  activePole: Pole | undefined;
  viewer: Viewer;
  hoveringGround: boolean;
  fixedLashing: Lashing | undefined;
  newLashing: Lashing | undefined;
  lastPole: Pole | undefined;
  currentSnapHeight: number | undefined;
  snapHelperLine: HelperLine;
  activePoleIsColliding: boolean = false;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = false;
    this.hoveringGround = false;
    this.snapHelperLine = new HelperLine();
    this.snapHelperLine.visible = false;
    this.viewer.scene.add(this.snapHelperLine);

    // load poles from local storage if available else add demo poles
    if (localStorage.getItem("poles") !== null) {
      this.viewer.saveTool.loadPolesFromLocalStorage();
    } else if (this.viewer.poles.length === 0) {
      this.addDemoPoles();
    }
    if (localStorage.getItem("lashes") !== null) {
      this.viewer.saveTool.loadLashingsFromLocalStorage();
    }
  }

  addDemoPoles() {
    const demoPole1 = new Pole();
    this.viewer.scene.add(demoPole1);
    this.viewer.poles.push(demoPole1);
    demoPole1.position.x = -0.07;
    demoPole1.position.y = 1.74;
    demoPole1.position.z = 0.1;
    demoPole1.setDirection(new THREE.Vector3(0, 1.8, 1));
    demoPole1.name = "demoPole1";

    const demoPole2 = new Pole();
    this.viewer.scene.add(demoPole2);
    this.viewer.poles.push(demoPole2);
    demoPole2.position.x = 0.9;
    demoPole2.position.y = 1.74;
    demoPole2.position.z = 0.93;
    demoPole2.setDirection(new THREE.Vector3(-1, 1.8, 0));
    demoPole2.name = "demoPole2";

    const demoPole3 = new Pole();
    this.viewer.scene.add(demoPole3);
    this.viewer.poles.push(demoPole3);
    demoPole3.position.x = 0.07;
    demoPole3.position.y = 1.74;
    demoPole3.position.z = 1.9;
    demoPole3.setDirection(new THREE.Vector3(0, 1.8, -1));
    demoPole3.name = "demoPole3";

    const demoPole4 = new Pole();
    this.viewer.scene.add(demoPole4);
    this.viewer.poles.push(demoPole4);
    demoPole4.position.x = -0.9;
    demoPole4.position.y = 1.74;
    demoPole4.position.z = 1.07;
    demoPole4.setDirection(new THREE.Vector3(1, 1.8, 0));
    demoPole4.name = "demoPole4";
  }

  activate() {
    if (this.active) return;
    this.activePole = new Pole();
    this.activePole.position.y = 200;
    this.viewer.scene.add(this.activePole);
    this.active = true;
  }

  deactivate() {
    if (this.activePole === undefined) {
      this.active = false;
      return;
    }
    this.viewer.scene.remove(this.activePole);
    this.activePole = undefined;
    this.active = false;
    this.fixedLashing = undefined;
    this.newLashing = undefined;
    this.lastPole = undefined;

    for (const pole of this.viewer.poles) {
      //@ts-ignore
      pole.mesh.material.color = new THREE.Color(1, 1, 1);
    }
  }

  drawPoleWhileHoveringGound(groundPosition: THREE.Vector3) {
    if (!this.activePole) return;

    this.newLashing = undefined;
    this.hoveringGround = true;
    this.snapHelperLine.visible = false;

    this.snapToGrid(groundPosition);

    if (this.fixedLashing) {
      this.placePoleBetweenOneLashingAndGround(groundPosition);
    } else {
      this.placePoleOnGround(groundPosition);
    }
  }

  drawPoleWhileHoveringOtherPole(
    position: THREE.Vector3,
    hoveredPole: Pole,
    normal: THREE.Vector3
  ) {
    if (!this.activePole) return;

    this.hoveringGround = false;

    if (!this.newLashing) {
      this.newLashing = new Lashing();
    }
    this.newLashing.setProperties(
      hoveredPole,
      this.activePole,
      position,
      normal
    );

    if (this.fixedLashing) {
      if (this.fixedLashing.fixedPole === hoveredPole) return;
      this.placePoleBetweenTwoLashings();
    } else {
      this.placePoleOnOneLashing();
    }
  }

  placePoleBetweenTwoLashings() {
    if (!this.activePole || !this.fixedLashing || !this.newLashing) return;
    // Step 1: Set naive pole position based on the anchorPoints
    this.activePole.setPositionBetweenTwoPoles(
      this.fixedLashing.anchorPoint,
      this.newLashing.anchorPoint
    );
    // Step 2: Use the pole's naive orientation to estimate the center coordinates of the lashings
    this.fixedLashing.calculatePositions();
    this.newLashing.calculatePositions();
    this.snapToHeight();
    // Step 3: Set the pole position with the estimated center coordinates
    this.activePole.setPositionBetweenTwoPoles(
      this.fixedLashing.centerLoosePole,
      this.newLashing.centerLoosePole
    );
    this.checkCollisions();
  }

  placePoleOnOneLashing() {
    if (!this.activePole || !this.newLashing) return;
    const targetOrientationVector = new THREE.Vector3().crossVectors(
      this.newLashing.anchorPointNormal,
      this.newLashing.fixedPole.direction
    );

    this.activePole.setDirection(targetOrientationVector);
    this.snapToHeight();

    this.activePole.position.set(
      this.newLashing.centerLoosePole.x,
      this.newLashing.centerLoosePole.y,
      this.newLashing.centerLoosePole.z
    );
  }

  placePoleBetweenOneLashingAndGround(groundPosition: THREE.Vector3) {
    if (!this.activePole || !this.fixedLashing) return;

    // Step 1: Set naive pole position based on the anchorPoint
    this.activePole.setPositionBetweenGroundAndPole(
      groundPosition,
      this.fixedLashing.anchorPoint
    );
    // Step 2: Use the pole's naive orientation to estimate the center coordinates of the lashing
    this.fixedLashing.calculatePositions();
    // Step 3: Set the pole position with the estimated center coordinates
    this.activePole.setPositionBetweenGroundAndPole(
      groundPosition,
      this.fixedLashing.centerLoosePole
    );
    this.checkCollisions();
  }

  placePoleOnGround(groundPosition: THREE.Vector3) {
    if (!this.activePole) return;
    this.activePole.setPositionOnGround(groundPosition);
    this.checkCollisions();
  }

  snapToHeight() {
    if (!this.activePole || !this.newLashing) return;

    this.currentSnapHeight = undefined;

    const snapLashings = this.viewer.lashings.filter(
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
    if (!this.activePole) return;
    if (this.activePoleIsColliding) return;
    if (this.fixedLashing || this.hoveringGround) {
      this.commitLashings();
      this.viewer.poles.push(this.activePole);
      this.lastPole = this.activePole;

      this.activePole = new Pole();
      this.activePole.position.y = 200;
      this.viewer.scene.add(this.activePole);
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
      this.viewer.lashings.push(this.fixedLashing);
    }
    if (this.newLashing) {
      this.viewer.lashings.push(this.newLashing);
    }
    console.log(this.viewer.lashings);
    this.fixedLashing = undefined;
    this.newLashing = undefined;
  }

  rightClick() {
    if (!this.activePole) return;
    this.activePole.setLength(4.0);
    this.activePole.position.y = 200;

    this.newLashing = undefined;
    this.fixedLashing = undefined;
  }

  checkCollisions() {
    if (!this.activePole) return;
    this.activePoleIsColliding = false;
    document.body.style.cursor = "default";

    const polesToCheck = this.viewer.poles.filter(
      (p) =>
        p !== this.fixedLashing?.fixedPole && p !== this.newLashing?.fixedPole
    );
    for (const pole of polesToCheck) {
      if (this.activePole.overlaps(pole)) {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 0, 0);
        this.activePoleIsColliding = true;
        document.body.style.cursor = "not-allowed";
      } else {
        // @ts-ignore
        pole.mesh.material.color = new THREE.Color(1, 1, 1);
      }
    }
  }
}
