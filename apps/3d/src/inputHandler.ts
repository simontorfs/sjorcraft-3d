import * as THREE from "three";
import { Pole } from "./pole";
import { Viewer } from "./viewer";
import { ButtonType } from "../../client/components/ToolbarItem";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export class InputHandler {
  viewer: Viewer;
  cursor: { x: number; y: number };
  mouseHasMoved: boolean;
  mouseDown: boolean;
  hoveredHandle: THREE.Mesh | undefined = undefined;
  ctrlDown: boolean;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    const domElement = this.viewer.domElement;

    this.mouseHasMoved = false;

    this.cursor = { x: 0, y: 0 };
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
    domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
    domElement.addEventListener("mouseup", this.onMouseUp.bind(this));
    domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  onKeyDown(event: any) {
    switch (event.key) {
      case "Delete":
      case "Backspace":
        if (this.ctrlDown) {
          event.preventDefault();
          this.viewer.saveTool.removeAllPoles();
          this.viewer.saveTool.removeAllLashings();
          this.viewer.saveTool.clearLocalStorage();
        } else {
          this.viewer.selectionTool.delete();
        }
        break;
      case "Control":
        this.ctrlDown = true;
        break;
      case "a":
        event.preventDefault();
        if (this.viewer.selectionTool.active && this.ctrlDown) {
          this.viewer.selectionTool.selectAll();
        }
        break;
      // case "s":
      //   this.viewer.saveTool.savePolesToLocalStorage();
      //   this.viewer.saveTool.saveLashingsToLocalStorage();
      //   break;
      // case "f":
      //   const length = Number(prompt("Enter the length of the floor"));
      //   const width = Number(prompt("Enter the width of the floor"));
      //   this.viewer.floor.setDimensions(length, width);
      //   break;
      default:
        console.log("down", event.key);
        break;
    }
  }

  onKeyUp(event: any) {
    switch (event.key) {
      case "Control":
        this.ctrlDown = false;
        break;
      default:
        console.log("up", event.key);
    }
  }

  onMouseDown(event: any) {
    this.mouseHasMoved = false;
    this.mouseDown = true;
  }

  onMouseUp(event: any) {
    this.mouseDown = false;
    if (this.mouseHasMoved) {
      if (this.viewer.selectionTool.active && this.hoveredHandle) {
        this.viewer.poleTransformer.dropHandle(this.hoveredHandle);
      }
    } else {
      if (this.viewer.poleTool.active) {
        if (event.button === THREE.MOUSE.LEFT) {
          this.viewer.poleTool.leftClick();
        } else if (event.button === THREE.MOUSE.RIGHT) {
          this.viewer.poleTool.rightClick();
        }
      } else if (this.viewer.selectionTool.active) {
        if (event.button === THREE.MOUSE.LEFT) {
          this.viewer.selectionTool.leftClick(this.ctrlDown);
        }
      } else if (this.viewer.bipodTool.active) {
        if (event.button === THREE.MOUSE.LEFT) {
          this.viewer.bipodTool.leftClick();
        } else {
          this.viewer.bipodTool.rightClick();
        }
      } else if (this.viewer.tripodTool.active) {
        if (event.button === THREE.MOUSE.LEFT) {
          this.viewer.tripodTool.leftClick();
        } else {
          this.viewer.tripodTool.rightClick();
        }
      }
    }
  }

  onMouseMove(event: any) {
    this.mouseHasMoved = true;
    const rect = this.viewer.renderer.domElement.getBoundingClientRect();
    this.cursor.x = (event.clientX - rect.left) / this.viewer.sizes.width - 0.5;
    this.cursor.y =
      -(event.clientY - rect.top) / this.viewer.sizes.height + 0.5;
    const groundPosition = this.getGroundPosition();
    const poleIntersect = this.getPoleIntersect();
    const hoveredPole = poleIntersect?.object.parent as Pole;

    if (this.viewer.poleTool.active) {
      if (poleIntersect?.normal) {
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.extractRotation(hoveredPole.matrix);

        const transformedNormal = poleIntersect.normal
          .clone()
          .applyMatrix4(rotationMatrix)
          .normalize();

        this.viewer.poleTool.drawPoleWhileHoveringOtherPole(
          poleIntersect.point,
          hoveredPole,
          transformedNormal
        );
      } else {
        this.viewer.poleTool.drawPoleWhileHoveringGound(groundPosition);
        this.viewer.poleTransformer.setActivePole(undefined);
      }
    } else if (this.viewer.selectionTool.active) {
      this.viewer.selectionTool.setHoveredPole(hoveredPole);
      if (this.hoveredHandle && this.mouseDown) {
        this.viewer.poleTransformer.dragHandle(this.hoveredHandle);
      } else {
        this.viewer.selectionTool.hoveredPole = hoveredPole;
        this.viewer.poleTransformer.setActivePole(hoveredPole);
        this.setHoveredHandle();
      }
    } else if (this.viewer.bipodTool.active) {
      this.viewer.bipodTool.drawBipod(groundPosition);
    } else if (this.viewer.tripodTool.active) {
      this.viewer.tripodTool.drawTripod(groundPosition);
    }
  }

  getPoleIntersect() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      new THREE.Vector2(this.cursor.x * 2, this.cursor.y * 2),
      this.viewer.camera
    );

    const intersects = raycaster.intersectObjects(
      this.viewer.poleInventory.poles.map((pole) => pole.mesh)
    );
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

  setHoveredHandle() {
    if (this.mouseDown) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      new THREE.Vector2(this.cursor.x * 2, this.cursor.y * 2),
      this.viewer.camera
    );

    const intersect = raycaster.intersectObject(this.viewer.poleTransformer);
    if (intersect.length) {
      this.hoveredHandle = intersect[0].object as THREE.Mesh;
      this.viewer.controls.enableRotate = false;
    } else {
      this.hoveredHandle = undefined;
      this.viewer.controls.enableRotate = true;
    }
    this.viewer.poleTransformer.setHoveredHandle(this.hoveredHandle);
  }

  getPointOnLineClosestToCursor(
    lineOrigin: THREE.Vector3,
    lineDirection: THREE.Vector3
  ) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      new THREE.Vector2(this.cursor.x * 2, this.cursor.y * 2),
      this.viewer.camera
    );
    const w0 = raycaster.ray.origin.clone().sub(lineOrigin);
    const a = lineDirection.dot(lineDirection);
    const b = lineDirection.dot(raycaster.ray.direction);
    const c = raycaster.ray.direction.dot(raycaster.ray.direction);
    const dDotW0 = lineDirection.dot(w0);
    const rayDirectionDotW0 = raycaster.ray.direction.dot(w0);

    const denom = a * c - b * b;
    const s = (b * rayDirectionDotW0 - c * dDotW0) / denom;
    const target = lineOrigin
      .clone()
      .sub(lineDirection.clone().multiplyScalar(s));

    return target;
  }

  onActivateTool(tool: ButtonType) {
    switch (tool) {
      case "selectiontool":
        this.viewer.poleTool.deactivate();
        this.viewer.bipodTool.deactivate();
        this.viewer.tripodTool.deactivate();
        this.viewer.destructionTool.deactivate();

        this.viewer.selectionTool.activate();
        break;
      case "poletool":
        this.viewer.selectionTool.deactivate();
        this.viewer.bipodTool.deactivate();
        this.viewer.tripodTool.deactivate();
        this.viewer.destructionTool.deactivate();

        this.viewer.poleTool.activate();
        break;
      case "bipodtool":
        this.viewer.selectionTool.deactivate();
        this.viewer.poleTool.deactivate();
        this.viewer.tripodTool.deactivate();
        this.viewer.destructionTool.deactivate();

        this.viewer.bipodTool.activate();
        break;
      case "tripodtool":
        this.viewer.selectionTool.deactivate();
        this.viewer.poleTool.deactivate();
        this.viewer.bipodTool.deactivate();
        this.viewer.destructionTool.deactivate();

        this.viewer.tripodTool.activate();
        break;
      case "polytool":
        // Activate polypedastraTool
        break;
      case "lashingtool":
        // Activate lashingTool
        break;
      case "destructiontool":
        this.viewer.selectionTool.deactivate();
        this.viewer.poleTool.deactivate();
        this.viewer.bipodTool.deactivate();
        this.viewer.tripodTool.deactivate();

        this.viewer.destructionTool.activate();
      default:
        break;
    }
  }
}
