import { Pole } from "./pole";
import * as THREE from "three";

export class Lashing {
  pole1: Pole;
  pole2: Pole;
  position: THREE.Vector3;
  constructor(pole1: Pole, pole2: Pole, position: THREE.Vector3) {
    this.pole1 = pole1;
    this.pole2 = pole2;
    this.position = position;
  }

  commit() {
    this.pole1.addLashing(this);
    this.pole2.addLashing(this);
  }
}
