import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InputHandler } from "./inputHandler";
import { Pole } from "./pole";
import { PoleTool } from "./poleTool";

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
    this.camera.position.z = 5;
    this.camera.position.y = 3;
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

    // Poles
    this.poles = [];
    this.poleTool = new PoleTool(this);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshBasicMaterial({
      opacity: 0.0,
      transparent: true,
    });
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.scene.add(this.floor);
  }
}
