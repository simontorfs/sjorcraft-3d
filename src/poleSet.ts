import { Color } from "three";

type PoleSet = { length: number; color: number }[];

const defaultPoleSet = [
  { length: 1.0, color: 0xffa500 },
  { length: 1.5, color: 0x00ff00 },
  { length: 2.0, color: 0xff0000 },
  { length: 2.5, color: 0x037c6e },
  { length: 3.0, color: 0xffffff },
  { length: 4.0, color: 0x0000ff },
  { length: 5.0, color: 0xffff00 },
  { length: 6.0, color: 0x000000 },
];

export class PoleSetManager {
  private static instance: PoleSetManager;
  private poleSet: PoleSet;
  private allowedPoleLengths: number[];
  private allowedScaffoldLengths: number[];
  private colors: Color[];

  private constructor() {
    this.poleSet = defaultPoleSet;
    this.allowedPoleLengths = this.calculateAllowedPoleLengths();
    this.allowedScaffoldLengths = this.calculateAllowedScaffoldLengths();
    this.colors = this.calculateColors();
  }

  public static getInstance(): PoleSetManager {
    if (!PoleSetManager.instance) {
      PoleSetManager.instance = new PoleSetManager();
    }
    return PoleSetManager.instance;
  }

  private calculateAllowedPoleLengths() {
    return this.poleSet.map((p) => p.length);
  }

  private calculateAllowedScaffoldLengths() {
    const singlePoleLengths = this.calculateAllowedPoleLengths();
    const scaffoldLengths = this.poleSet
      .map((p) => p.length * 2)
      .filter((l) => l > singlePoleLengths.at(-1) + Number.EPSILON);
    return [...singlePoleLengths, ...scaffoldLengths];
  }

  private calculateColors() {
    return this.poleSet.map((p) => new Color(p.color));
  }

  public getPoleSet(): PoleSet {
    return this.poleSet;
  }

  public setPoleSet(newPoleSet: PoleSet): void {
    this.poleSet = newPoleSet.sort((a, b) => a.length - b.length);
    this.allowedPoleLengths = this.calculateAllowedPoleLengths();
    this.allowedScaffoldLengths = this.calculateAllowedScaffoldLengths();
    this.colors = this.calculateColors();
  }

  public getAllowedPoleLengths() {
    return this.allowedPoleLengths;
  }

  public getAllowedScaffoldLengths() {
    return this.allowedScaffoldLengths;
  }

  public getPoleColors() {
    return this.colors;
  }
}
