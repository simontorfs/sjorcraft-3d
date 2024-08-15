import { ColladaExporter } from "https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/exporters/ColladaExporter.js";
import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { Lashing } from "./lashing";

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
        this.removeAllPoles();
        data.poles.forEach((pole: any) => {
          const newPole = new Pole();
          newPole.loadFromJson(pole);
          this.viewer.scene.add(newPole);
          this.viewer.poles.push(newPole);
        });
        data.lashings.forEach((lashing: any) => {
          const newLashing = new Lashing();
          if (newLashing.loadFromJson(lashing, this.viewer.poles)) {
            this.viewer.lashings.push(newLashing);
          }
        });
      };
      reader.readAsText(file);
    });
  }

  importPoles() {
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
        this.removeAllPoles();
        data.forEach((pole: any) => {
          const newPole = new Pole();
          newPole.loadFromJson(pole);
          this.viewer.scene.add(newPole);
          this.viewer.poles.push(newPole);
        });
      };
      reader.readAsText(file);
    });
  }

  exportAll(name: string) {
    const poles = this.viewer.poles.map((pole) => pole.saveToJson());
    const lashings = this.viewer.lashings.map((lashing) =>
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
      .replace(/-/g, "")}-${name}_poles.sjor`;
    a.click();
  }
  exportPoles(name: string) {
    const poles = this.viewer.poles.map((pole) => pole.saveToJson());
    const data = JSON.stringify(poles, null, 2);
    const blob = new Blob([data], { type: "text/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${name}_poles.sjor`;
    a.click();
  }

  removeAllPoles() {
    this.viewer.poles.forEach((pole) => {
      this.viewer.scene.remove(pole);
    });
    this.viewer.poles = [];
  }

  savePolesToLocalStorage() {
    const poles = this.viewer.poles.map((pole) => pole.saveToJson());
    localStorage.setItem("poles", JSON.stringify(poles));
  }

  loadPolesFromLocalStorage() {
    const poles = JSON.parse(localStorage.getItem("poles") as string);
    this.removeAllPoles();
    poles.forEach((pole: any) => {
      const newPole = new Pole();
      newPole.loadFromJson(pole);
      this.viewer.scene.add(newPole);
      this.viewer.poles.push(newPole);
    });
  }
  removeAllLashings() {
    // this.viewer.lashings.forEach((lashing) => {
    //   this.viewer.scene.remove(lashing);
    // });
    this.viewer.lashings = [];
  }

  saveLashingsToLocalStorage() {
    const lashings = this.viewer.lashings.map((lashing) =>
      lashing.saveToJson()
    );
    localStorage.setItem("lashings", JSON.stringify(lashings));
  }

  loadLashingsFromLocalStorage() {
    const lashings = JSON.parse(localStorage.getItem("lashings") as string);
    this.removeAllLashings();
    lashings.forEach((lashing: any) => {
      const newLashing = new Lashing();
      if (newLashing.loadFromJson(lashing, this.viewer.poles)) {
        this.viewer.lashings.push(newLashing);
      }
    });
  }

  exportToCollada() {
    const exporter = new THREE.ColladaExporter();
    const collada = exporter.parse(this.viewer.scene);
    const blob = new Blob([collada.data], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.dae";
    a.click();
  }

  //clear local storage
  clearLocalStorage() {
    localStorage.clear();
  }
}
