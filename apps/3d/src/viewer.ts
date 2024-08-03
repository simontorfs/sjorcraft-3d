import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { InputHandler } from "./inputHandler";
import { Pole } from "./pole";
import { PoleTool } from "./poleTool";
import { SaveTool } from "./saveTool";
import { DetailsTool } from "./detailsTool";
import { SelectionTool } from "./selectionTool";
import { Floor } from "./floor";
import { BipodTool } from "./bipodTool";
import { Lashing } from "./lashing";
import { TripodTool } from "./tripodTool";

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

  poles: Pole[];
  lashings: Lashing[];
  saveTool: SaveTool;
  detailsTool: DetailsTool;
  floor: Floor;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.canvas = document.createElement("canvas");
    this.domElement.appendChild(this.canvas);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.scene = new THREE.Scene();

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.renderer.setSize(this.sizes.width, this.sizes.height);

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
    this.floor.setNewFloor(50, 50, new THREE.Color("green"));
    // Light
    const ambientLight = new THREE.AmbientLight();
    this.scene.add(ambientLight);

    //add background
    this.scene.background = new THREE.Color(0x87ceeb);

    // Details tool
    this.detailsTool = new DetailsTool(this);

    // Save tool
    this.saveTool = new SaveTool(this);

    this.poles = [];

    // Lashings
    this.lashings = [];

    // Tools
    this.selectionTool = new SelectionTool(this);
    this.selectionTool.activate();
    this.poleTool = new PoleTool(this);
    this.bipodTool = new BipodTool(this);
    this.tripodTool = new TripodTool(this);

    const tick = () => {
      this.controls.update();

      this.renderer.render(this.scene, this.camera);

      window.requestAnimationFrame(tick);
    };

    tick();
  }
}
