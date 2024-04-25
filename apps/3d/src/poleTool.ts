import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

export class PoleTool {
  active: boolean;
  activePole: Pole | undefined;
  snapPlain: THREE.Mesh;
  viewer: Viewer;
  firstPointPlaced: boolean;
  firstPoint: THREE.Vector3;
  hoveringGround: boolean;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = false;
    this.firstPointPlaced = false;
    this.firstPoint = new THREE.Vector3(0, 0, 0);
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
    if (this.firstPointPlaced) {
      this.activePole.setPositionByTwoPoints(position, this.firstPoint);
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

    if (this.firstPointPlaced) {
    } else {
      const targetOrientationVector = new THREE.Vector3().crossVectors(
        normal,
        hoveredPole.direction
      );

      this.activePole.setDirection(targetOrientationVector);

      this.activePole.position.set(position.x, position.y, position.z);
      this.firstPoint.set(position.x, position.y, position.z);
      this.activePole.mesh.position.set(0, 0, 0);

      this.hoveringGround = false;
    }
  }

  click() {
    if (!this.activePole) return;
    if (this.firstPointPlaced || this.hoveringGround) {
      this.viewer.poles.push(this.activePole);

      this.activePole = new Pole();
      this.viewer.scene.add(this.activePole);
      this.firstPointPlaced = false;
    } else {
      this.firstPointPlaced = true;
    }
  }
}
