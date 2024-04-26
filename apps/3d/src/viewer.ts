import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InputHandler } from "./inputHandler";
import { Pole } from "./pole";
import { PoleTool } from "./poleTool";
import { SaveTool } from "./saveTool";
import { DetailsTool } from "./detailsTool";

export class Viewer {
  canvas: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  sizes: { width: number; height: number };
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  inputHandler: InputHandler;
  poleTool: PoleTool;
  poles: Pole[];
  floor: THREE.Mesh;
  saveTool: SaveTool;
  detailsTool: DetailsTool;

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

    // Light
    const ambientLight = new THREE.AmbientLight();
    this.scene.add(ambientLight);

    //add background
    this.scene.background = new THREE.Color(0x87ceeb);

    // Poles
    this.poles = [];
    this.poleTool = new PoleTool(this);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshBasicMaterial({
      opacity: 0.5,
      transparent: false,
      color: "green",
    });

    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.scene.add(this.floor);

    // add grid to floor of 1 by 1
    const grid = new THREE.GridHelper(50, 50, 0x888888, 0x888888);
    grid.position.y = 0.01;
    grid.material.opacity = 0.65;
    grid.material.transparent = true;
    this.scene.add(grid);

    // Save tool
    this.saveTool = new SaveTool(this);

    // Details Tool
    this.detailsTool = new DetailsTool(this);
    this.detailsTool.getPoleDetails();
    this.detailsTool.getTouchingPoints();
  }
}
