import { Pole } from "./../objects/pole";
import { Viewer } from "../viewer";
import { SquareLashing } from "../objects/lashings/squareLashing";
import { ColladaExporter } from "./colladaExporter";
import { STLExporter } from "./stlExporter";

export type TObjectArray = Array<Pole | SquareLashing>;
export class SaveTool {
  viewer: Viewer;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  importAll() {
    const fileInput = document.getElementById("file") as HTMLInputElement;
    fileInput.click();
    fileInput.addEventListener("change", () => {
      const file = fileInput.files![0];
      const reader = new FileReader();
      reader.onload = () => {
        // check if extension is .sjor otherwise ignore
        if (file.name.split(".").pop() !== "sjor") {
          return;
        }
        const data = JSON.parse(reader.result as string);
        this.viewer.inventory.removeAll();

        const importedPoles: Pole[] = [];
        data.poles.forEach((pole: any) => {
          const newPole = new Pole();
          newPole.loadFromJson(pole);
          this.viewer.scene.add(newPole);
          importedPoles.push(newPole);
        });
        this.viewer.inventory.addPoles(importedPoles);

        const importedLashings: SquareLashing[] = [];
        data.lashings.forEach((lashing: any) => {
          const newLashing = new SquareLashing();
          if (newLashing.loadFromJson(lashing, this.viewer.inventory.poles)) {
            this.viewer.scene.add(newLashing);
            importedLashings.push(newLashing);
          }
        });
        this.viewer.inventory.addLashings(importedLashings);
      };
      reader.readAsText(file);
    });
  }

  exportAll(name: string) {
    const poles = this.viewer.inventory.poles.map((pole) => pole.saveToJson());
    const lashings = this.viewer.inventory.lashings.map((lashing) =>
      lashing.saveToJson()
    );
    const data = JSON.stringify({ poles: poles, lashings: lashings }, null, 2);
    const blob = new Blob([data], { type: "text/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${name}.sjor`;
    a.click();
  }

  savePolesToLocalStorage() {
    const poles = this.viewer.inventory.poles.map((pole) => pole.saveToJson());
    localStorage.setItem("poles", JSON.stringify(poles));
  }

  loadPolesFromLocalStorage() {
    const poles = JSON.parse(localStorage.getItem("poles") as string);
    this.viewer.inventory.removeAll();
    poles.forEach((pole: any) => {
      const newPole = new Pole();
      newPole.loadFromJson(pole);
      this.viewer.scene.add(newPole);
      this.viewer.inventory.addPoles([newPole]);
    });
  }

  saveLashingsToLocalStorage() {
    const lashings = this.viewer.inventory.lashings.map((lashing) =>
      lashing.saveToJson()
    );
    localStorage.setItem("lashings", JSON.stringify(lashings));
  }

  loadLashingsFromLocalStorage() {
    const lashings = JSON.parse(localStorage.getItem("lashings") as string);
    this.viewer.inventory.removeAll();
    lashings.forEach((lashing: any) => {
      const newLashing = new SquareLashing();
      if (newLashing.loadFromJson(lashing, this.viewer.inventory.poles)) {
        this.viewer.inventory.addLashings([newLashing]);
      }
    });
  }

  loadFromLocalStorage(poles: boolean, lashings: boolean) {
    if (poles) this.loadPolesFromLocalStorage();
    if (lashings) this.loadLashingsFromLocalStorage();
  }

  exportToSTL(name?: string, exportLashings?: boolean) {
    7;
    const filename = name ? name : "model";
    const exporter = new STLExporter();
    const options = {
      binary: true,
    };

    let objects: TObjectArray = [];
    if (exportLashings) {
      objects = [
        ...this.viewer.inventory.poles,
        ...this.viewer.inventory.lashings,
      ];
    } else {
      objects = this.viewer.inventory.poles;
    }
    const workingScene = this.viewer.scene.clone();
    workingScene.rotation.x = Math.PI / 2;

    const result = exporter.parse(objects, options);
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${filename}.stl`;
    a.click();
    a.remove();
  }

  exportToDAE(name?: string, exportLashings?: boolean) {
    const filename = name ? name : "model";
    const exporter = new ColladaExporter();
    let objects: TObjectArray = [];
    if (exportLashings) {
      objects = [
        ...this.viewer.inventory.poles,
        ...this.viewer.inventory.lashings,
      ];
    } else {
      objects = this.viewer.inventory.poles;
    }
    const result = exporter.parse(objects);
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${filename}.dae`;
    a.click();
    a.remove();
  }

  //clear local storage
  clearLocalStorage() {
    localStorage.removeItem("poles");
    localStorage.removeItem("lashings");
  }
}
