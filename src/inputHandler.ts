import * as THREE from "three";
import { Pole } from "./pole";
import { Viewer } from "./viewer";

export class InputHandler {
  viewer: Viewer;
  cursor: { x: number; y: number };
  mouseHasMoved: boolean;
  hoveredObject: Pole | undefined;

  constructor(viewer: Viewer) {
    this.viewer = viewer;

    this.mouseHasMoved = false;

    this.cursor = { x: 0, y: 0 };
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  onKeyDown(event: any) {
    if (event.key === "b") {
      const pole = new Pole();
      this.viewer.scene.add(pole);
      this.viewer.poles.push(pole);
    }
  }

  onMouseDown(event: any) {
    this.mouseHasMoved = false;
    this.hoveredObject = this.getHoveredObject();
  }

  onMouseUp(event: any) {
    if (this.mouseHasMoved) {
      // drop
    } else {
      // click
    }
  }

  onMouseMove(event: any) {
    this.mouseHasMoved = true;
    this.cursor.x = event.clientX / this.viewer.sizes.width - 0.5;
    this.cursor.y = -event.clientY / this.viewer.sizes.height + 0.5;
    console.log(this.getGroundPosition());
  }

  getHoveredObject() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      new THREE.Vector2(this.cursor.x * 2, this.cursor.y * 2),
      this.viewer.camera
    );

    const intersects = raycaster.intersectObjects(this.viewer.poles);
    if (intersects.length) {
      return intersects[0].object as Pole;
    }
    return;
  }

  getGroundPosition() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      new THREE.Vector2(this.cursor.x * 2, this.cursor.y * 2),
      this.viewer.camera
    );

    const intersect = raycaster.intersectObject(this.viewer.floor);
    if (intersect.length) {
      return intersect[0].point;
    }
    return;
  }
}
