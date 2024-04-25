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
        const data = JSON.parse(reader.result as string);
        console.log("testData", data);
        this.removeAllPoles();
        data.forEach((pole: any) => {
          const newPole = new Pole();
          newPole.position.set(
            pole.position.x,
            pole.position.y,
            pole.position.z
          );
          newPole.setDirection(
            new THREE.Vector3(
              pole.direction.x,
              pole.direction.y,
              pole.direction.z
            )
          );
          newPole.name = pole.name;
          newPole.mesh.position.set(pole.mesh.x, pole.mesh.y, pole.mesh.z);
          newPole.rotation.set(
            pole.rotation._x,
            pole.rotation._y,
            pole.rotation._z
          );
          this.viewer.scene.add(newPole);
          this.viewer.poles.push(newPole);
        });
      };
      reader.readAsText(file);
    });
  }

  exportPoles(name: string) {
    const poles = this.viewer.poles.map((pole) => {
      return {
        position: pole.position,
        direction: pole.direction,
        name: pole.name,
        mesh: pole.mesh.position,
        rotation: pole.rotation,
      };
    });
    const data = JSON.stringify(poles, null, 2);
    const blob = new Blob([data], { type: "text/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${name}_poles.json`;
    a.click();
  }

  removeAllPoles() {
    this.viewer.poles.forEach((pole) => {
      this.viewer.scene.remove(pole);
    });
    this.viewer.poles = [];
  }
}
