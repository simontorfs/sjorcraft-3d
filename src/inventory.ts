import { BipodLashing } from "./objects/lashings/bipodLashing";
import { SquareLashing } from "./objects/lashings/squareLashing";
import { ScaffoldLashing } from "./objects/lashings/scaffoldLashing";
import { Pole } from "./objects/pole";
import { Viewer } from "./viewer";
import * as THREE from "three";
import { TripodLashing } from "./objects/lashings/tripodLashing";
import { PoleSetManager } from "./poleSet";

interface IPolesDetail {
  length: number;
  number: number;
  color: string;
}

export class Inventory {
  viewer: Viewer;
  poles: Pole[] = [];
  lashings: SquareLashing[] = [];
  bipodLashings: BipodLashing[] = [];
  tripodLashings: TripodLashing[] = [];
  scaffoldLashings: ScaffoldLashing[] = [];

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

  addLashings(lashings: SquareLashing[]) {
    this.lashings.push(...lashings);
    (this.viewer.scene as any).dispatchEvent({
      type: "new_lashing_placed",
      lashings: lashings,
    });
  }

  addLashingSimple(lashing: SquareLashing) {
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

  addTripodLashings(lashings: TripodLashing[]) {
    this.tripodLashings.push(...lashings);

    (this.viewer.scene as any).dispatchEvent({
      type: "new_tripod_lashing_placed",
      lashings,
    });
  }

  addTripodLashingSimple(lashing: TripodLashing) {
    this.tripodLashings.push(lashing);
  }

  addScaffoldLashings(lashings: ScaffoldLashing[]) {
    this.scaffoldLashings.push(...lashings);

    (this.viewer.scene as any).dispatchEvent({
      type: "new_scaffold_lashing_placed",
      lashings: lashings,
    });
  }

  addScaffoldLashingSimple(lashing: ScaffoldLashing) {
    this.scaffoldLashings.push(lashing);
  }

  removePoleSimple(poleToRemove: Pole) {
    this.viewer.scene.remove(poleToRemove);
    this.poles = this.poles.filter((pole) => pole !== poleToRemove);
  }

  removeLashings(lashingsToRemove: SquareLashing[]) {
    this.viewer.scene.remove(...lashingsToRemove);

    this.lashings = this.lashings.filter(
      (lashing) => !lashingsToRemove.includes(lashing)
    );

    (this.viewer.scene as any).dispatchEvent({
      type: "lashing_removed",
      lashings: lashingsToRemove,
    });
  }

  removeLashingSimple(lashingToRemove: SquareLashing) {
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

  removeTripodLashings(lashingsToRemove: TripodLashing[]) {
    this.viewer.scene.remove(...lashingsToRemove);

    this.tripodLashings = this.tripodLashings.filter(
      (lashing) => !lashingsToRemove.includes(lashing)
    );

    (this.viewer.scene as any).dispatchEvent({
      type: "tripod_lashing_removed",
      lashings: lashingsToRemove,
    });
  }

  removeTripodLashingSimple(lashingToRemove: TripodLashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.tripodLashings = this.tripodLashings.filter(
      (lashing) => lashingToRemove !== lashing
    );
  }

  removeScaffoldLashings(lashingsToRemove: ScaffoldLashing[]) {
    this.viewer.scene.remove(...lashingsToRemove);

    this.scaffoldLashings = this.scaffoldLashings.filter(
      (lashing) => !lashingsToRemove.includes(lashing)
    );

    (this.viewer.scene as any).dispatchEvent({
      type: "scaffold_lashing_removed",
      lashings: lashingsToRemove,
    });
  }

  removeScaffoldLashingSimple(lashingToRemove: ScaffoldLashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.scaffoldLashings = this.scaffoldLashings.filter(
      (lashing) => lashing !== lashingToRemove
    );
  }

  removePoles(polesToRemove: Pole[]) {
    this.viewer.scene.remove(...polesToRemove);
    this.poles = this.poles.filter((pole) => !polesToRemove.includes(pole));

    const lashingsToRemove: SquareLashing[] = [];
    const bipodLashingsToRemove: BipodLashing[] = [];
    const tripodLashingsToRemove: TripodLashing[] = [];
    const scaffoldLashingsToRemove: ScaffoldLashing[] = [];

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

      for (const lashing of this.viewer.inventory.tripodLashings) {
        if (
          lashing.leftPole === poleToRemove ||
          lashing.middlePole === poleToRemove ||
          lashing.rightPole === poleToRemove
        ) {
          tripodLashingsToRemove.push(lashing);
        }
      }

      for (const lashing of this.viewer.inventory.scaffoldLashings) {
        if (lashing.pole1 === poleToRemove || lashing.pole2 === poleToRemove) {
          scaffoldLashingsToRemove.push(lashing);
        }
      }
    }

    (this.viewer.scene as any).dispatchEvent({
      type: "pole_removed",
      poles: polesToRemove,
    });

    this.removeLashings(lashingsToRemove);
    this.removeBipodLashings(bipodLashingsToRemove);
    this.removeTripodLashings(tripodLashingsToRemove);
    this.removeScaffoldLashings(scaffoldLashingsToRemove);
  }

  removeAll() {
    this.removePoles(this.poles);
    this.removeLashings(this.lashings);
    this.removeBipodLashings(this.bipodLashings);
    this.removeTripodLashings(this.tripodLashings);
    this.removeScaffoldLashings(this.scaffoldLashings);
  }

  getPolesGroupedByLength() {
    const poleSet = PoleSetManager.getInstance();
    const poles: Pole[] = this.poles;
    const polesGroupedByLength: IPolesDetail[] = [];
    const allowedLengths = poleSet.getAllowedPoleLengths();
    const colors = poleSet.getPoleColors();

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

  setPoleset(newSet: { length: number; color: number }[]) {
    const poleSet = PoleSetManager.getInstance();
    poleSet.setPoleSet(newSet);
  }

  resetPoleset() {
    const poleSet = PoleSetManager.getInstance();
    poleSet.resetPoleset();
  }
}
