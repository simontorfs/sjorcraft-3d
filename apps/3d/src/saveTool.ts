import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";

export class SaveTool {
  viewer: Viewer;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
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

  //clear local storage
  clearLocalStorage() {
    localStorage.clear();
  }
}
