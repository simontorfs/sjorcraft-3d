import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { Lashing } from "./lashing";
import { PoleInventory } from "./poleInventory";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

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
          this.viewer.poleInventory.addPole(newPole);
        });
        data.lashings.forEach((lashing: any) => {
          const newLashing = new Lashing();
          if (
            newLashing.loadFromJson(lashing, this.viewer.poleInventory.poles)
          ) {
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
          this.viewer.poleInventory.addPole(newPole);
        });
      };
      reader.readAsText(file);
    });
  }

  exportAll(name: string) {
    const poles = this.viewer.poleInventory.poles.map((pole) =>
      pole.saveToJson()
    );
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
      .replace(/-/g, "")}-${name}.sjor`;
    a.click();
  }
  exportPoles(name: string) {
    const poles = this.viewer.poleInventory.poles.map((pole) =>
      pole.saveToJson()
    );
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

  removeAllPoles() {
    this.viewer.poleInventory.removeAll();
  }

  savePolesToLocalStorage() {
    const poles = this.viewer.poleInventory.poles.map((pole) =>
      pole.saveToJson()
    );
    localStorage.setItem("poles", JSON.stringify(poles));
  }

  loadPolesFromLocalStorage() {
    const poles = JSON.parse(localStorage.getItem("poles") as string);
    this.removeAllPoles();
    poles.forEach((pole: any) => {
      const newPole = new Pole();
      newPole.loadFromJson(pole);
      this.viewer.scene.add(newPole);
      this.viewer.poleInventory.addPole(newPole);
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
      if (newLashing.loadFromJson(lashing, this.viewer.poleInventory.poles)) {
        this.viewer.lashings.push(newLashing);
      }
    });
  }

  saveString(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/plain" });
    console.log("Werk jij", blob);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  exportGLTF(name: string) {
    const gltfExporter = new GLTFExporter();

    const options = {
      trs: true,
      onlyVisible: true,
      binary: false,
    };

    const input = this.viewer.scene;
    input.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.updateMatrixWorld();
      }
    });
    gltfExporter.parse(
      this.viewer.scene,
      function (result) {
        let output: string = JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: "text/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "")}-${name}.gltf`;
        a.click();
      },
      function (error) {
        console.log("An error happened during parsing", error);
      },
      options
    );
  }

  //clear local storage
  clearLocalStorage() {
    localStorage.clear();
  }
}
