import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { Lashing } from "./lashing";

export class PoleTool {
  active: boolean;
  activePole: Pole | undefined;
  viewer: Viewer;
  hoveringGround: boolean;
  fixedLashing: Lashing | undefined;
  newLashing: Lashing | undefined;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = false;
    this.hoveringGround = false;
    this.addDemoPoles();
  }

  addDemoPoles() {
    const demoPole1 = new Pole();
    this.viewer.scene.add(demoPole1);
    this.viewer.poles.push(demoPole1);
    demoPole1.position.x = -0.07;
    demoPole1.position.y = 0;
    demoPole1.position.z = -0.8;
    demoPole1.mesh.position.y = 2;
    demoPole1.setDirection(new THREE.Vector3(0, 1.8, 1));
    demoPole1.name = "demoPole1";

    const demoPole2 = new Pole();
    this.viewer.scene.add(demoPole2);
    this.viewer.poles.push(demoPole2);
    demoPole2.position.x = 1.8;
    demoPole2.position.y = 0;
    demoPole2.position.z = 0.93;
    demoPole2.mesh.position.y = 2;
    demoPole2.setDirection(new THREE.Vector3(-1, 1.8, 0));
    demoPole2.name = "demoPole2";

    const demoPole3 = new Pole();
    this.viewer.scene.add(demoPole3);
    this.viewer.poles.push(demoPole3);
    demoPole3.position.x = 0.07;
    demoPole3.position.y = 0;
    demoPole3.position.z = 2.8;
    demoPole3.mesh.position.y = 2;
    demoPole3.setDirection(new THREE.Vector3(0, 1.8, -1));
    demoPole3.name = "demoPole3";

    const demoPole4 = new Pole();
    this.viewer.scene.add(demoPole4);
    this.viewer.poles.push(demoPole4);
    demoPole4.position.x = -1.8;
    demoPole4.position.y = 0;
    demoPole4.position.z = 1.07;
    demoPole4.mesh.position.y = 2;
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
  }

  drawPoleWhileHoveringGound(groundPosition: THREE.Vector3) {
    if (!this.activePole) return;

    this.newLashing = undefined;
    this.hoveringGround = true;

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
      this.newLashing = new Lashing(
        hoveredPole,
        this.activePole,
        position,
        normal
      );
    } else {
      this.newLashing.setProperties(
        hoveredPole,
        this.activePole,
        position,
        normal
      );
    }

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
    // Step 3: Set the pole position with the estimated center coordinates
    this.activePole.setPositionBetweenTwoPoles(
      this.fixedLashing.centerLoosePole,
      this.newLashing.centerLoosePole
    );
  }

  placePoleOnOneLashing() {
    if (!this.activePole || !this.newLashing) return;
    const targetOrientationVector = new THREE.Vector3().crossVectors(
      this.newLashing.anchorPointNormal,
      this.newLashing.fixedPole.direction
    );

    this.activePole.setDirection(targetOrientationVector);

    this.activePole.position.set(
      this.newLashing.centerLoosePole.x,
      this.newLashing.centerLoosePole.y,
      this.newLashing.centerLoosePole.z
    );
    this.activePole.mesh.position.set(0, 0, 0);
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
  }

  placePoleOnGround(groundPosition: THREE.Vector3) {
    if (!this.activePole) return;
    this.activePole.setPositionOnGround(groundPosition);
  }

  leftClick() {
    if (!this.activePole) return;
    if (this.fixedLashing || this.hoveringGround) {
      this.commitLashings();
      this.viewer.poles.push(this.activePole);

      this.activePole = new Pole();
      this.activePole.position.y = 200;
      this.viewer.scene.add(this.activePole);
    } else {
      this.fixedLashing = this.newLashing;
      this.newLashing = undefined;
    }
  }

  commitLashings() {
    this.fixedLashing?.commit();
    this.newLashing?.commit();
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
}
