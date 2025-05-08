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

  addLashings(lashings: Lashing[]) {
    this.lashings.push(...lashings);
    (this.viewer.scene as any).dispatchEvent({
      type: "new_lashing_placed",
      lashings: lashings,
    });
  }

  addLashingSimple(lashing: Lashing) {
    this.lashings.push(lashing);
  }

  addBipodLashings(lashings: BipodLashing[]) {
    this.bipodLashings.push(...lashings);

    (this.viewer.scene as any).dispatchEvent({
      type: "new_bipod_lashing_placed",
      lashings: lashings,
    });
  }

  addBipodLashingSimple(lashing: BipodLashing) {
    this.bipodLashings.push(lashing);
  }

  removePoleSimple(poleToRemove: Pole) {
    this.viewer.scene.remove(poleToRemove);
    this.poles = this.poles.filter((pole) => pole !== poleToRemove);
  }

  removeLashings(lashingsToRemove: Lashing[]) {
    this.viewer.scene.remove(...lashingsToRemove);

    this.lashings = this.lashings.filter(
      (lashing) => !lashingsToRemove.includes(lashing)
    );

    (this.viewer.scene as any).dispatchEvent({
      type: "lashing_removed",
      lashings: lashingsToRemove,
    });
  }

  removeLashingSimple(lashingToRemove: Lashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.lashings = this.lashings.filter(
      (lashing) => lashing !== lashingToRemove
    );
  }

  removeBipodLashings(lashingsToRemove: BipodLashing[]) {
    this.viewer.scene.remove(...lashingsToRemove);

    this.bipodLashings = this.bipodLashings.filter(
      (lashing) => !lashingsToRemove.includes(lashing)
    );

    (this.viewer.scene as any).dispatchEvent({
      type: "bipod_lashing_removed",
      lashings: lashingsToRemove,
    });
  }

  removeBipodLashingSimple(lashingToRemove: BipodLashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.bipodLashings = this.bipodLashings.filter(
      (lashing) => lashing !== lashingToRemove
    );
  }

  removePoles(polesToRemove: Pole[]) {
    this.viewer.scene.remove(...polesToRemove);
    this.poles = this.poles.filter((pole) => !polesToRemove.includes(pole));

    const lashingsToRemove: Lashing[] = [];
    const bipodLashingsToRemove: BipodLashing[] = [];

    for (const poleToRemove of polesToRemove) {
      for (const lashing of this.viewer.inventory.lashings) {
        if (
          lashing.loosePole === poleToRemove ||
          lashing.fixedPole === poleToRemove
        ) {
          lashingsToRemove.push(lashing);
        }
      }

      for (const lashing of this.viewer.inventory.bipodLashings) {
        if (lashing.pole1 === poleToRemove || lashing.pole2 === poleToRemove) {
          bipodLashingsToRemove.push(lashing);
        }
      }
    }

    (this.viewer.scene as any).dispatchEvent({
      type: "pole_removed",
      poles: polesToRemove,
    });

    this.removeLashings(lashingsToRemove);
    this.removeBipodLashings(bipodLashingsToRemove);
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
