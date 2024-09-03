import { Pole } from "./pole";
import { Viewer } from "./viewer";
import { Lashing } from "./lashing";
import * as THREE from "three";
import { OBJExporter, STLExporter } from "three/examples/jsm/Addons";
import { ColladaExporter } from "./colladaExporter";

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
        data.poles.forEach((pole: any) => {
          const newPole = new Pole();
          newPole.loadFromJson(pole);
          this.viewer.scene.add(newPole);
          this.viewer.inventory.addPole(newPole);
        });
        data.lashings.forEach((lashing: any) => {
          const newLashing = new Lashing();
          if (newLashing.loadFromJson(lashing, this.viewer.inventory.poles)) {
            this.viewer.inventory.addLashing(newLashing);
            this.viewer.scene.add(newLashing);
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
        this.viewer.inventory.removeAll();
        data.forEach((pole: any) => {
          const newPole = new Pole();
          newPole.loadFromJson(pole);
          this.viewer.scene.add(newPole);
          this.viewer.inventory.addPole(newPole);
        });
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
  exportPoles(name: string) {
    const poles = this.viewer.inventory.poles.map((pole) => pole.saveToJson());
    const data = JSON.stringify(poles, null, 2);
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
      this.viewer.inventory.addPole(newPole);
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
      const newLashing = new Lashing();
      if (newLashing.loadFromJson(lashing, this.viewer.inventory.poles)) {
        this.viewer.inventory.addLashing(newLashing);
      }
    });
  }

  exportToSTL() {
    const exporter = new STLExporter();
    const workingScene = this.viewer.scene.clone();
    workingScene.updateMatrixWorld();
    workingScene.updateMatrix();
    workingScene.updateWorldMatrix(true, true);
    workingScene.remove(this.viewer.floor);
    workingScene.rotation.set(0, 0, 0);
    workingScene.scale.set(1, 1, 1);
    workingScene.position.set(0, 0, 0);
    workingScene.rotation.x = Math.PI / 2;
    workingScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.updateMatrix();
        child.updateWorldMatrix(true, true);
      }
    });
    const result = exporter.parse(workingScene);
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.stl";
    a.click();
    a.remove();
  }

  exportToDAE(name?: string) {
    const filename = name ? name : "model";
    const exporter = new ColladaExporter();
    const result = exporter.parse(this.viewer.scene);
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
    localStorage.clear();
  }
}
