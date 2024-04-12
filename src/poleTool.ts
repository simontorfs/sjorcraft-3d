import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

export class PoleTool {
  active: boolean;
  activePole: Pole;
  snapPlain: THREE.Mesh;
  viewer: Viewer;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = true;
    this.addDemoPoles();
  }

  addDemoPoles() {
    const demoPole1 = new Pole();
    this.viewer.scene.add(demoPole1);
    this.viewer.poles.push(demoPole1);
    demoPole1.position.x = -0.07;
    demoPole1.position.y = 1;
    demoPole1.position.z = 0.2;
    demoPole1.rotation.x = Math.PI / 6;
    demoPole1.rotation.y = 0;
    demoPole1.rotation.z = 0;

    const demoPole2 = new Pole();
    this.viewer.scene.add(demoPole2);
    this.viewer.poles.push(demoPole2);
    demoPole2.position.x = 0.8;
    demoPole2.position.y = 1;
    demoPole2.position.z = 0.93;
    demoPole2.rotation.x = 0;
    demoPole2.rotation.y = 0;
    demoPole2.rotation.z = Math.PI / 6;

    const demoPole3 = new Pole();
    this.viewer.scene.add(demoPole3);
    this.viewer.poles.push(demoPole3);
    demoPole3.position.x = 0.07;
    demoPole3.position.y = 1;
    demoPole3.position.z = 1.8;
    demoPole3.rotation.x = -Math.PI / 6;
    demoPole3.rotation.y = 0;
    demoPole3.rotation.z = 0;

    const demoPole4 = new Pole();
    this.viewer.scene.add(demoPole4);
    this.viewer.poles.push(demoPole4);
    demoPole4.position.x = -0.8;
    demoPole4.position.y = 1;
    demoPole4.position.z = 1.07;
    demoPole4.rotation.x = 0;
    demoPole4.rotation.y = 0;
    demoPole4.rotation.z = -Math.PI / 6;
  }

  setActivePole(pole: Pole) {
    this.activePole = pole;
  }

  dragPole() {}
}
