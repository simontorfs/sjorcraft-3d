import { Pole } from "./pole";
import * as THREE from "three";
import { Viewer } from "./viewer";
import { Lashing } from "./lashing";

export class SaveTool {
  viewer: Viewer;
  localSaveFile: string = "poles_lashings";
  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }
  // loading
  fromJSON(input: string) {
    const data = JSON.parse(input);
    this.removeAll();
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
  }

  loadFromLocalStorage() {
    this.fromJSON(localStorage.getItem(this.localSaveFile) as string);
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
        this.fromJSON(reader.result as string);
      };
      reader.readAsText(file);
    });
  }
  // saving
  toJSON(): string {
    const poles = this.viewer.poles.map((pole) => pole.saveToJson());
    const lashings = this.viewer.lashings.map((lashing) =>
      lashing.saveToJson()
    );
    return JSON.stringify({ poles: poles, lashings: lashings }, null, 2);
  }

  saveToLocalStorage() {
    localStorage.setItem(this.localSaveFile, this.toJSON());
  }

  exportAll(name: string) {
    const data: string = this.toJSON();
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

  // others
  removeAll() {
    this.viewer.poles.forEach((pole) => {
      this.viewer.scene.remove(pole);
    });
    this.viewer.poles = [];
    this.viewer.lashings = [];
  }

  //clear local storage
  clearLocalStorage() {
    localStorage.clear();
  }
}
