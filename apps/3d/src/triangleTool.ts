import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { Lashing } from "./lashing";

interface IPoles {
  [key: string]: Set<string>;
}

export class TriangleTool {
  viewer: Viewer;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }
  getTriangles() {
    const poles: Map<string, Set<string>> = new Map(
      this.viewer.poles.map((pole) => [pole.uuid, new Set()])
    );
    const lashings: Lashing[] = this.viewer.lashings;
    lashings.forEach((lashing) => {
      poles.get(lashing.fixedPole.uuid)!.add(lashing.loosePole.uuid);
      poles.get(lashing.loosePole.uuid)!.add(lashing.fixedPole.uuid);
    });

    // // split between loose poles and candidates. candidates should have at least 2 poles connected
    // const triangleCandidates: Map<string, Set<string>> = new Map();
    // for (const [key, set] of poles.entries()) {
    //   if (set.size > 1) {
    //     triangleCandidates.set(key, set);
    //   }
    // }

    const fixedPoles: Set<string> = new Set();
    // for each set of each pole, check if this pole is in the set of the other poles
    for (const [key, set] of poles.entries()) {
      set.forEach((uuid) => {
        poles.get(uuid)?.forEach((uuid2) => {
          if (poles.get(uuid2)?.has(key)) {
            fixedPoles.add(key);
            fixedPoles.add(uuid);
            fixedPoles.add(uuid2);
          }
        });
      });
    }
    // TODO in plaats van driehoeken zoeken moeten we zoeken naar 2 balken die geen 3de balk hebben --> deze twee balken zijn dan ook niet goed verbonden!
    // Eventueel kunnen we ze dan een tool geven die de paren van balken aanduiden die gene driehoek zijn.
    const looseConnections: Set<Set<string>> = new Set();
    // for each set of each pole, check if this pole is in the set of the other poles
    for (const [key, set] of poles.entries()) {
      set.forEach((uuid) => {
        const temp_set: Set<string> = new Set();
        poles.get(uuid)?.forEach((uuid2) => {
          poles.get(uuid2)?.forEach((uuid3) => {
            temp_set.add(uuid3);
          });
        });
        // Need to do some string manipulaiton for the tuples; I have duplicates ;(
        if (!temp_set.has(key)) {
          const tempString: string[] = [key, uuid];
          tempString.sort();
          looseConnections.add(new Set(tempString));
        }
      });
    }

    console.log(looseConnections);
    // console.log(fixedPoles);
  }
}
