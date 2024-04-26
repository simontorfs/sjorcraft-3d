import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { Lashing } from "./lashing";

export class PoleTool {
  active: boolean;
  activePole: Pole | undefined;
  snapPlain: THREE.Mesh;
  viewer: Viewer;
  hoveringGround: boolean;
  hoveredPole: Pole | undefined;
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
    this.activePole = new Pole();
    this.viewer.scene.add(this.activePole);
    this.active = true;
    console.log("activate");
  }

  deactivate() {
    if (this.activePole === undefined) {
      this.active = false;
      return;
    }
    this.viewer.scene.remove(this.activePole);
    this.activePole = undefined;
    this.active = false;
    console.log("deactivate");
  }

  drawPole(position: THREE.Vector3) {
    if (!this.activePole) return;
    this.hoveredPole = undefined;
    this.newLashing = undefined;
    if (this.fixedLashing) {
      this.activePole.setPositionBetweenGroundAndPole(
        position,
        this.fixedLashing.centerPole2
      );
    } else {
      this.activePole.position.set(position.x, position.y, position.z);
      this.activePole.mesh.position.set(0, 2, 0);
      this.activePole.setDirection(new THREE.Vector3(0, 1, 0));
      this.hoveringGround = true;
    }
  }

  drawPoleWhileHoveringOtherPole(
    position: THREE.Vector3,
    hoveredPole: Pole,
    normal: THREE.Vector3
  ) {
    if (!this.activePole) return;

    if (!this.newLashing) {
      this.hoveredPole = hoveredPole;
      this.newLashing = new Lashing(
        hoveredPole,
        this.activePole,
        position,
        normal
      );
    } else {
      this.newLashing.update(position, normal);
    }
    if (this.fixedLashing) {
      if (this.fixedLashing.pole1 === hoveredPole) return;
      this.activePole.setPositionBetweenTwoPoles(
        this.fixedLashing.centerPole2,
        this.newLashing.centerPole2
      );
    } else {
      const targetOrientationVector = new THREE.Vector3().crossVectors(
        normal,
        hoveredPole.direction
      );

      this.activePole.setDirection(targetOrientationVector);

      this.activePole.position.set(
        this.newLashing.centerPole2.x,
        this.newLashing.centerPole2.y,
        this.newLashing.centerPole2.z
      );
      this.activePole.mesh.position.set(0, 0, 0);

      this.hoveringGround = false;
    }
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
