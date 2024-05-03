import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InputHandler } from "./inputHandler";
import { Pole } from "./pole";
import { PoleTool } from "./poleTool";
import { SaveTool } from "./saveTool";
import { DetailsTool } from "./detailsTool";
import { SelectionTool } from "./selectionTool";
import { Floor } from "./floor";
import { imageExporter } from "./imageExporter";

export class Viewer {
  canvas: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  sizes: { width: number; height: number };
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  inputHandler: InputHandler;
  poleTool: PoleTool;
  selectionTool: SelectionTool;
  poles: Pole[];
  saveTool: SaveTool;
  detailsTool: DetailsTool;
  floor: Floor;
  imageExporter: imageExporter;

  constructor() {
    this.sizes = { width: window.innerWidth, height: window.innerHeight };
    window.addEventListener("resize", () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.sizes.width, this.sizes.height);
    });
    window.addEventListener("dblclick", () => {
      if (!document.fullscreenElement) {
        this.canvas.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
    this.canvas = document.querySelector("canvas.webgl")!;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height
    );
    this.camera.position.z = 4;
    this.camera.position.y = 5;
    this.camera.position.x = 1;
    this.scene.add(this.camera);

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = false;

    this.inputHandler = new InputHandler(this);

    // Axes helper
    // const axesHelper = new THREE.AxesHelper();
    // this.scene.add(axesHelper);

    // Floor
    this.floor = new Floor(this);
    this.floor.setNewFloor(50, 50, "green");
    // Light
    const ambientLight = new THREE.AmbientLight();
    this.scene.add(ambientLight);

    //add background
    this.scene.background = new THREE.Color(0x87ceeb);

    // Details tool
    this.detailsTool = new DetailsTool(this);

    // Save tool
    this.saveTool = new SaveTool(this);

    // Image Exporter
    this.imageExporter = new imageExporter(this);

    // Poles
    this.poles = [];

    // Tools
    this.poleTool = new PoleTool(this);
    this.selectionTool = new SelectionTool(this);
    this.selectionTool.activate();
  }
}
