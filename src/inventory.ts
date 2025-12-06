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

  addItems({
    poles = [],
    squareLashings = [],
    bipodLashings = [],
    tripodLashings = [],
    scaffoldLashings = [],
  }: {
    poles?: Pole[];
    squareLashings?: SquareLashing[];
    bipodLashings?: BipodLashing[];
    tripodLashings?: TripodLashing[];
    scaffoldLashings?: ScaffoldLashing[];
  }) {
    this.poles.push(...poles);
    this.lashings.push(...squareLashings);
    this.bipodLashings.push(...bipodLashings);
    this.tripodLashings.push(...tripodLashings);
    this.scaffoldLashings.push(...scaffoldLashings);

    (this.viewer.scene as any).dispatchEvent({
      type: "new_items_placed",
      poles,
      squareLashings,
      bipodLashings,
      tripodLashings,
      scaffoldLashings,
    });
  }

  removeItems({
    poles = [],
    squareLashings = [],
    bipodLashings = [],
    tripodLashings = [],
    scaffoldLashings = [],
  }: {
    poles?: Pole[];
    squareLashings?: SquareLashing[];
    bipodLashings?: BipodLashing[];
    tripodLashings?: TripodLashing[];
    scaffoldLashings?: ScaffoldLashing[];
  }) {
    this.viewer.scene.remove(...poles);
    this.viewer.scene.remove(...squareLashings);
    this.viewer.scene.remove(...bipodLashings);
    this.viewer.scene.remove(...tripodLashings);
    this.viewer.scene.remove(...scaffoldLashings);

    this.poles = this.poles.filter((pole) => !poles.includes(pole));
    this.lashings = this.lashings.filter(
      (lashing) => !squareLashings.includes(lashing)
    );
    this.bipodLashings = this.bipodLashings.filter(
      (lashing) => !bipodLashings.includes(lashing)
    );
    this.tripodLashings = this.tripodLashings.filter(
      (lashing) => !tripodLashings.includes(lashing)
    );
    this.scaffoldLashings = this.scaffoldLashings.filter(
      (lashing) => !scaffoldLashings.includes(lashing)
    );

    (this.viewer.scene as any).dispatchEvent({
      type: "items_removed",
      poles,
      squareLashings,
      bipodLashings,
      tripodLashings,
      scaffoldLashings,
    });
  }

  pushPoles(poles: Pole[]) {
    this.poles.push(...poles);
  }

  pushLashing(lashing: SquareLashing) {
    this.lashings.push(lashing);
  }

  pushBipodLashing(lashing: BipodLashing) {
    this.bipodLashings.push(lashing);
  }

  pushTripodLashing(lashing: TripodLashing) {
    this.tripodLashings.push(lashing);
  }

  pushScaffoldLashing(lashing: ScaffoldLashing) {
    this.scaffoldLashings.push(lashing);
  }

  removePole(poleToRemove: Pole) {
    this.viewer.scene.remove(poleToRemove);
    this.poles = this.poles.filter((pole) => pole !== poleToRemove);
  }

  removeSquareLashing(lashingToRemove: SquareLashing) {
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
  }

  removeTripodLashing(lashingToRemove: TripodLashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.tripodLashings = this.tripodLashings.filter(
      (lashing) => lashingToRemove !== lashing
    );
  }

  removeScaffoldLashing(lashingToRemove: ScaffoldLashing) {
    this.viewer.scene.remove(lashingToRemove);

    this.scaffoldLashings = this.scaffoldLashings.filter(
      (lashing) => lashing !== lashingToRemove
    );
  }

  removePoles(polesToRemove: Pole[]) {
    const squareLashingsToRemove: SquareLashing[] = [];
    const bipodLashingsToRemove: BipodLashing[] = [];
    const tripodLashingsToRemove: TripodLashing[] = [];
    const scaffoldLashingsToRemove: ScaffoldLashing[] = [];

    for (const poleToRemove of polesToRemove) {
      for (const lashing of this.viewer.inventory.lashings) {
        if (
          lashing.loosePole === poleToRemove ||
          lashing.fixedPole === poleToRemove
        ) {
          squareLashingsToRemove.push(lashing);
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

    this.removeItems({
      poles: polesToRemove,
      squareLashings: squareLashingsToRemove,
      bipodLashings: bipodLashingsToRemove,
      tripodLashings: tripodLashingsToRemove,
      scaffoldLashings: scaffoldLashingsToRemove,
    });
  }

  removeAll() {
    this.removeItems({
      poles: this.poles,
      squareLashings: this.lashings,
      bipodLashings: this.bipodLashings,
      tripodLashings: this.tripodLashings,
      scaffoldLashings: this.scaffoldLashings,
    });
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

  getLashPointsOnPole(pole: Pole) {
    return [
      ...this.lashings
        .filter((l) => l.fixedPole === pole || l.loosePole === pole)
        .map((l) => pole.getProjectedPoint(l.position)),
      ...this.bipodLashings
        .filter((l) => l.pole1 === pole || l.pole2 === pole)
        .map((l) => pole.getProjectedPoint(l.position)),
      ...this.tripodLashings
        .filter((l) => l.leftPole === pole)
        .map((l) => l.centerLeftPole),
      ...this.tripodLashings
        .filter((l) => l.rightPole === pole)
        .map((l) => l.centerRightPole),
      ...this.tripodLashings
        .filter((l) => l.middlePole === pole)
        .map((l) => l.centerMiddlePole),
    ];
  }
}
