import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InputHandler } from "./inputHandler";
import { PoleTool } from "./tools/poleTool";
import { SaveTool } from "./exporters/saveTool";
import { SelectionTool } from "./tools/selectionTool";
import { Floor } from "./objects/floor";
import { ImageExporter } from "./exporters/imageExporter";
import { BipodTool } from "./tools/bipodTool";
import { TripodTool } from "./tools/tripodTool";
import { PolypedestraTool } from "./tools/polypedestraTool";
import { DestructionTool } from "./tools/destructionTool";
import { LashingTool } from "./tools/lashingTool";
import { PoleTransformer } from "./tools/poleTransformer";
import { Inventory } from "./inventory";

export class Viewer {
  domElement: HTMLElement;
  canvas: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  sizes: { width: number; height: number };
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  inputHandler: InputHandler;

  selectionTool: SelectionTool;
  poleTool: PoleTool;
  bipodTool: BipodTool;
  tripodTool: TripodTool;
  polypedestraTool: PolypedestraTool;
  destructionTool: DestructionTool;
  lashingTool: LashingTool;
  poleTransformer: PoleTransformer;

  inventory: Inventory;
  saveTool: SaveTool;
  floor: Floor;
  imageExporter: ImageExporter;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.canvas = document.createElement("canvas");
    this.domElement.appendChild(this.canvas);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.scene = new THREE.Scene();

    this.sizes = {
      width: domElement.clientWidth,
      height: domElement.clientHeight,
    };
    this.renderer.setSize(this.sizes.width, this.sizes.height);

    window.addEventListener("resize", () => {
      this.sizes.width = domElement.clientWidth;
      this.sizes.height = domElement.clientHeight;

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

    // Floor
    this.floor = new Floor(this);
    this.floor.setNewFloor(50, 50, new THREE.Color("#2a6e3c"), false);

    // Light
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color("#ffffff"),
      0.3
    );
    ambientLight.name = "ambient_light";
    this.camera.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      new THREE.Color("#ffffff"),
      1.5
    );
    directionalLight.position.set(0.5, 0, 0.866); // ~60º
    directionalLight.name = "main_light";
    this.camera.add(directionalLight);

    //add background
    this.scene.background = new THREE.Color("#9bc2f9");

    // Save tool
    this.saveTool = new SaveTool(this);

    // Image Exporter
    this.imageExporter = new ImageExporter(this);

    // Poles and lashings
    this.inventory = new Inventory(this);

    // Tools
    this.selectionTool = new SelectionTool(this);
    this.selectionTool.activate();
    this.poleTool = new PoleTool(this);
    this.bipodTool = new BipodTool(this);
    this.tripodTool = new TripodTool(this);
    this.polypedestraTool = new PolypedestraTool(this);
    this.destructionTool = new DestructionTool(this);
    this.lashingTool = new LashingTool(this);
    this.poleTransformer = new PoleTransformer(this);
    this.scene.add(this.poleTransformer);

    const tick = () => {
      this.controls.update();

      this.renderer.render(this.scene, this.camera);

      window.requestAnimationFrame(tick);
    };

    tick();
  }
}
