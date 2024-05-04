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
    switch (event.key) {
      case "h":
        this.viewer.poleTool.deactivate();
        this.viewer.bipodTool.deactivate();

        this.viewer.selectionTool.activate();
        break;
      case "j":
        this.viewer.selectionTool.deactivate();
        this.viewer.bipodTool.deactivate();

        this.viewer.poleTool.activate();
        break;
      case "k":
        this.viewer.selectionTool.deactivate();
        this.viewer.poleTool.deactivate();

        this.viewer.bipodTool.activate();
        break;
      case "l":
        this.viewer.selectionTool.deactivate();
        this.viewer.poleTool.deactivate();
        this.viewer.bipodTool.deactivate();

        // Activate tripodTool
        break;
      case "m":
        this.viewer.selectionTool.deactivate();
        this.viewer.poleTool.deactivate();
        this.viewer.bipodTool.deactivate();

        // Activate polypedastraTool
        break;
      case "Delete":
        this.viewer.selectionTool.delete();
        break;
      case "e":
        this.viewer.saveTool.exportPoles("demo");
        break;
      case "i":
        this.viewer.saveTool.importPoles();
        break;
      case "c":
        this.viewer.detailsTool.getPolesGroupedByLength();
        break;
      case "r":
        this.viewer.saveTool.removeAllPoles();
        this.viewer.saveTool.clearLocalStorage();
        break;
      case "s":
        this.viewer.saveTool.savePolesToLocalStorage();
        break;
      case "f":
        const length = Number(prompt("Enter the length of the floor"));
        const width = Number(prompt("Enter the width of the floor"));
        this.viewer.floor.setDimensions(length, width);
        break;
      default:
        console.log(event.key);
        break;
    }
  }

  onMouseDown(event: any) {
    this.mouseHasMoved = false;
  }

  onMouseUp(event: any) {
    if (this.mouseHasMoved) {
      // drop after drag
    } else {
      if (this.viewer.poleTool.active) {
        if (event.button === THREE.MOUSE.LEFT) {
          this.viewer.poleTool.leftClick();
        } else if (event.button === THREE.MOUSE.RIGHT) {
          this.viewer.poleTool.rightClick();
        }
      } else if (this.viewer.selectionTool.active) {
        if (event.button === THREE.MOUSE.LEFT) {
          this.viewer.selectionTool.leftClick();
        }
      } else if (this.viewer.bipodTool.active) {
        if (event.button === THREE.MOUSE.LEFT) {
          this.viewer.bipodTool.leftClick();
        } else {
          this.viewer.bipodTool.rightClick();
        }
      }
    }
  }

  onMouseMove(event: any) {
    this.mouseHasMoved = true;
    this.cursor.x = event.clientX / this.viewer.sizes.width - 0.5;
    this.cursor.y = -event.clientY / this.viewer.sizes.height + 0.5;
    const groundPosition = this.getGroundPosition();
    const intersect = this.getPoleIntersect();
    const hoveredPole = intersect?.object.parent as Pole;
    if (this.viewer.poleTool.active) {
      if (intersect?.normal) {
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.extractRotation(hoveredPole.matrix);

        const transformedNormal = intersect.normal
          .clone()
          .applyMatrix4(rotationMatrix)
          .normalize();

        this.viewer.poleTool.drawPoleWhileHoveringOtherPole(
          intersect.point,
          hoveredPole,
          transformedNormal
        );
      } else {
        this.viewer.poleTool.drawPoleWhileHoveringGound(groundPosition);
      }
    } else if (this.viewer.selectionTool.active) {
      this.viewer.selectionTool.hoveredPole = hoveredPole;
    } else if (this.viewer.bipodTool.active) {
      this.viewer.bipodTool.drawBipod(groundPosition);
    }
  }

  getPoleIntersect() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      new THREE.Vector2(this.cursor.x * 2, this.cursor.y * 2),
      this.viewer.camera
    );

    const intersects = raycaster.intersectObjects(this.viewer.poles);
    if (intersects.length) {
      return intersects[0];
    }
    return;
  }

  getGroundPosition() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      new THREE.Vector2(this.cursor.x * 2, this.cursor.y * 2),
      this.viewer.camera
    );

    const intersect = raycaster.intersectObject(this.viewer.floor.mesh);
    if (intersect.length) {
      return intersect[0].point;
    }
    return new THREE.Vector3(0, 0, 0);
  }
}
