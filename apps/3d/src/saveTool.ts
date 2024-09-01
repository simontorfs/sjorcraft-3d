import { Pole } from "./pole";
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

  //clear local storage
  clearLocalStorage() {
    localStorage.clear();
  }
}
