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

    // all poles that are part of at least one triangle
    const fixedPoles: Set<string> = new Set();
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

    // all poles which are not a part of a triangle
    const loosePoles: Set<string> = new Set(
      Array.from(poles.keys()).filter((key) => !fixedPoles.has(key))
    );

    // all sets of 2 poles which are not connected by a third pole; missing a triagle!
    // This might be the most usefull for implementation as this can be visualised
    // Auto-trianglification?
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
    console.log("fixedpoles:", fixedPoles);
    console.log("loosepoles:", loosePoles);
    console.log("looseConnections;", looseConnections);
    // console.log(fixedPoles);
  }
}

// class u {
//   dictionary: { [key: string]: string[] };
//   set: Set<string>;

//   constructor() {
//     this.dictionary = {};
//     this.set = new Set();
//   }

//   // Method to add an element to the dictionary
//   add(key: string, value: string): void {
//     if (!this.dictionary[key]) {
//       this.dictionary[key] = [];
//     }
//     this.dictionary[key].push(value);
//   }

//   // Method to add an element to the set
//   addToSet(value: string): void {
//     this.set.add(value);
//   }

//   // Method to check if an element exists in the dictionary for a given key
//   isInDictionary(key: string, value: string): boolean {
//     return this.dictionary[key] && this.dictionary[key].includes(value);
//   }

//   // Method to check if an element exists in the set
//   isInSet(value: string): boolean {
//     return this.set.has(value);
//   }
// }
