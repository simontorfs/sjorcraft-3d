import * as THREE from "three";
import { Pole } from "./objects/pole";
import { Viewer } from "./viewer";
import { Tool } from "./tools/tool";
import { Lashing } from "./objects/lashings/lashing";

export class InputHandler {
  viewer: Viewer;
  cursor: THREE.Vector2;
  mouseHasMoved: boolean;
  mouseDown: boolean;
  ctrlDown: boolean;
  activeTool: Tool;

  private onKeyDownBound: (event: KeyboardEvent) => void;
  private onKeyUpBound: (event: KeyboardEvent) => void;
  private onMouseDownBound: (event: MouseEvent) => void;
  private onMouseUpBound: (event: MouseEvent) => void;
  private onMouseMoveBound: (event: MouseEvent) => void;
  private onDoubleClickBound: (event: MouseEvent) => void;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    const domElement = this.viewer.domElement;
    this.activeTool = viewer.selectionTool;

    this.mouseHasMoved = false;

    this.cursor = new THREE.Vector2();

    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onKeyUpBound = this.onKeyUp.bind(this);
    this.onMouseDownBound = this.onMouseDown.bind(this);
    this.onMouseUpBound = this.onMouseUp.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onDoubleClickBound = this.onDoubleClick.bind(this);

    window.addEventListener("keydown", this.onKeyDownBound);
    window.addEventListener("keyup", this.onKeyUpBound);
    domElement.addEventListener("mousedown", this.onMouseDownBound);
    domElement.addEventListener("mouseup", this.onMouseUpBound);
    domElement.addEventListener("mousemove", this.onMouseMoveBound);
    domElement.addEventListener("dblclick", this.onDoubleClickBound);
  }

  onDoubleClick() {
    // TODO: Implement zoomto clicked location, preferably only in selection tool
  }

  onKeyDown(event: any) {
    switch (event.key) {
      case "Delete":
      case "Backspace":
        this.viewer.selectionTool.deleteSelectedPoles();
        break;
      case "Control":
        this.ctrlDown = true;
        break;
      case "ArrowUp":
        this.activeTool.onArrowUp();
        break;
      case "ArrowDown":
        this.activeTool.onArrowDown();
        break;
      case "a":
        event.preventDefault();
        if (this.viewer.selectionTool.active && this.ctrlDown) {
          this.viewer.selectionTool.selectAll();
        }
        break;
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
      this.activeTool.onMouseDrop();
    } else {
      if (event.button === THREE.MOUSE.LEFT) {
        if (this.ctrlDown) {
          this.activeTool.onCtrlLeftClick();
        } else {
          this.activeTool.onLeftClick();
        }
      } else if (event.button === THREE.MOUSE.RIGHT) {
        this.activeTool.onRightClick();
      }
    }
  }

  onMouseMove(event: any) {
    this.mouseHasMoved = true;
    const rect = this.viewer.renderer.domElement.getBoundingClientRect();
    this.cursor.x =
      2.0 * ((event.clientX - rect.left) / this.viewer.sizes.width - 0.5);
    this.cursor.y =
      2.0 * (-(event.clientY - rect.top) / this.viewer.sizes.height + 0.5);

    if (this.mouseDown) {
      this.activeTool.onMouseDrag();
    } else {
      this.activeTool.onMouseMove();
    }
  }

  getHoveredObject() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.cursor, this.viewer.camera);

    const intersects = raycaster.intersectObjects([
      ...this.viewer.inventory.poles.map((pole) => pole.mesh),
      ...this.viewer.inventory.lashings.map((lashing) => lashing.mesh),
      ...this.viewer.inventory.bipodLashings.map((lashing) => lashing.mesh),
      ...this.viewer.inventory.scaffoldLashings.map((lashing) => lashing.mesh),
    ]);

    if (intersects.length) {
      return intersects[0].object.parent as Pole | Lashing;
    } else {
      return undefined;
    }
  }

  getHoveredPole() {
    const intersect = this.getPoleIntersect();
    return intersect?.object.parent as Pole;
  }

  getPoleIntersect() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.cursor, this.viewer.camera);

    const intersects = raycaster.intersectObjects(
      this.viewer.inventory.poles.map((pole) => pole.mesh)
    );

    if (intersects.length) {
      return intersects[0];
    } else {
      return undefined;
    }
  }

  getHoveredGroundPosition() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.cursor, this.viewer.camera);

    const intersect = raycaster.intersectObject(this.viewer.floor.mesh);
    if (intersect.length) {
      return intersect[0].point;
    }
    return null;
  }

  getPointOnLineClosestToCursor(
    lineOrigin: THREE.Vector3,
    lineDirection: THREE.Vector3
  ) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.cursor, this.viewer.camera);
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

  deactiveTools() {
    this.viewer.selectionTool.deactivate();
    this.viewer.poleTool.deactivate();
    this.viewer.bipodTool.deactivate();
    this.viewer.tripodTool.deactivate();
    this.viewer.polypedestraTool.deactivate();
    this.viewer.destructionTool.deactivate();
    this.viewer.lashingTool.deactivate();
    this.viewer.transformationTool.deactivate();
  }

  onActivateTool(tool: string) {
    this.deactiveTools();
    switch (tool) {
      case "selectiontool":
        this.activeTool = this.viewer.selectionTool;
        break;
      case "poletool":
        this.activeTool = this.viewer.poleTool;
        break;
      case "bipodtool":
        this.activeTool = this.viewer.bipodTool;
        break;
      case "tripodtool":
        this.activeTool = this.viewer.tripodTool;
        break;
      case "polypedestratool":
        this.activeTool = this.viewer.polypedestraTool;
        break;
      case "lashingtool":
        this.activeTool = this.viewer.lashingTool;
        break;
      case "destructiontool":
        this.activeTool = this.viewer.destructionTool;
        break;
      case "transformationtool":
        this.activeTool = this.viewer.transformationTool;
        break;
      default:
        break;
    }
    this.activeTool.activate();
  }

  cleanup() {
    const domElement = this.viewer.domElement;
    window.removeEventListener("keydown", this.onKeyDownBound);
    window.removeEventListener("keyup", this.onKeyUpBound);
    domElement.removeEventListener("mousedown", this.onMouseDownBound);
    domElement.removeEventListener("mouseup", this.onMouseUpBound);
    domElement.removeEventListener("mousemove", this.onMouseMoveBound);
    domElement.removeEventListener("dblclick", this.onDoubleClickBound);
  }
}
