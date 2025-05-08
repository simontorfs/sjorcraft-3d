import { BipodLashing } from "./objects/lashings/bipodLashing";
import { Lashing } from "./objects/lashings/lashing";
import { Pole, colors, allowedLengths } from "./objects/pole";
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
  bipodLashings: BipodLashing[] = [];

  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  addPoles(poles: Pole[]) {
    this.poles.push(...poles);

    (this.viewer.scene as any).dispatchEvent({
      type: "new_pole_placed",
      poles: poles,
    });
  }

  addPoleSimple(pole: Pole) {
    this.poles.push(pole);
  }

  addLashing(lashing: Lashing) {
    this.lashings.push(lashing);
    (this.viewer.scene as any).dispatchEvent({
      type: "new_lashing_placed",
      lashing: lashing,
    });
  }

  addLashingSimple(lashing: Lashing) {
    this.lashings.push(lashing);
  }

  addBipodLashing(lashing: BipodLashing) {
    this.bipodLashings.push(lashing);

    (this.viewer.scene as any).dispatchEvent({
      type: "new_bipod_lashing_placed",
      lashing: lashing,
    });
  }

  addBipodLashingSimple(lashing: BipodLashing) {
    this.bipodLashings.push(lashing);
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

    for (const lashing of this.viewer.inventory.bipodLashings) {
      if (lashing.pole1 === poleToRemove || lashing.pole2 === poleToRemove) {
        this.removeBipodLashing(lashing);
      }
    }

    (this.viewer.scene as any).dispatchEvent({
      type: "pole_removed",
      poles: [poleToRemove],
    });
  }

  removePoleSimple(poleToRemove: Pole) {
    this.viewer.scene.remove(poleToRemove);
    this.poles = this.poles.filter((pole) => pole !== poleToRemove);
  }

  removeLashing(lashingToRemove: Lashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.lashings = this.lashings.filter(
      (lashing) => lashing !== lashingToRemove
    );

    (this.viewer.scene as any).dispatchEvent({
      type: "lashing_removed",
      lashings: [lashingToRemove],
    });
  }

  removeLashingSimple(lashingToRemove: Lashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.lashings = this.lashings.filter(
      (lashing) => lashing !== lashingToRemove
    );
  }

  removeBipodLashing(lashingToRemove: BipodLashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.bipodLashings = this.bipodLashings.filter(
      (lashing) => lashing !== lashingToRemove
    );

    (this.viewer.scene as any).dispatchEvent({
      type: "bipod_lashing_removed",
      lashings: [lashingToRemove],
    });
  }

  removeBipodLashingSimple(lashingToRemove: BipodLashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.bipodLashings = this.bipodLashings.filter(
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

    for (const lashing of this.bipodLashings) {
      this.viewer.scene.remove(lashing);
    }
    this.bipodLashings = [];
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

  getAmountOfBipodLashings() {
    return this.bipodLashings.length;
  }

  resetAllColors() {
    for (const pole of this.poles) {
      //@ts-ignore
      pole.mesh.material.color = new THREE.Color(1, 1, 1);
    }
  }
}
