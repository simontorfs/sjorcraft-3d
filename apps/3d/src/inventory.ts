import { Lashing } from "./lashing";
import { Pole, colors, allowedLengths } from "./pole";
import { Viewer } from "./viewer";
import * as THREE from "three";

interface IPolesDetail {
  length: number;
  number: number;
  color: string;
}

export class Inventory {
  viewer: Viewer;
  poles: Pole[] = [];
  lashings: Lashing[] = [];

  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  addPole(pole: Pole) {
    this.poles.push(pole);
    (this.viewer.scene as any).dispatchEvent({
      type: "new_pole_placed",
      pole: pole,
    });
  }

  addLashing(lashing: Lashing) {
    this.lashings.push(lashing);
    (this.viewer.scene as any).dispatchEvent({
      type: "new_lashing_placed",
      lashing: lashing,
    });
  }

  removePole(poleToRemove: Pole) {
    this.viewer.scene.remove(poleToRemove);
    this.poles = this.poles.filter((pole) => pole !== poleToRemove);
    for (const lashing of this.viewer.inventory.lashings) {
      if (
        lashing.loosePole === poleToRemove ||
        lashing.fixedPole === poleToRemove
      ) {
        this.removeLashing(lashing);
      }
    }
    (this.viewer.scene as any).dispatchEvent({
      type: "pole_removed",
      pole: poleToRemove,
    });
  }

  removeLashing(lashingToRemove: Lashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.viewer.inventory.lashings = this.lashings.filter(
      (lashing) => lashing !== lashingToRemove
    );
  }

  removePoles(polesToRemove: Pole[]) {
    for (const pole of polesToRemove) {
      this.removePole(pole);
    }
  }

  removeAll() {
    for (const pole of this.poles) {
      this.viewer.scene.remove(pole);
    }
    this.poles = [];

    for (const lashing of this.lashings) {
      this.viewer.scene.remove(lashing);
    }
    this.lashings = [];
  }

  getPolesGroupedByLength() {
    const poles: Pole[] = this.poles;
    const polesGroupedByLength: IPolesDetail[] = [];

    for (length of allowedLengths) {
      const number = poles.reduce((acc, pole) => {
        if (pole.length === length) {
          return acc + 1;
        } else {
          return acc;
        }
      }, 0);
      const index = allowedLengths.indexOf(length);
      polesGroupedByLength.push({
        length,
        number,
        color: `#${colors[index].getHexString()}`,
      });
    }
    return polesGroupedByLength;
  }

  getAmountOfLashings() {
    return this.lashings.length;
  }

  resetAllColors() {
    for (const pole of this.poles) {
      //@ts-ignore
      pole.mesh.material.color = new THREE.Color(1, 1, 1);
    }
  }
}
