import * as THREE from "three";
import { Viewer } from "./../viewer";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

const size = 50;

const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load("/textures/grass/grass_basecolor.jpg");
const waterNormals = textureLoader.load(
  "/textures/water/waternormals.jpg",
  function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }
);

grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.colorSpace = THREE.SRGBColorSpace;
grassTexture.repeat.y = size;
grassTexture.repeat.x = size;

export class Floor extends THREE.Object3D {
  viewer: Viewer;
  geometry: THREE.PlaneGeometry;
  mesh: THREE.Mesh;
  grid: THREE.GridHelper;
  water?: Water;
  constructor(viewer: Viewer) {
    super();
    this.viewer = viewer;
    const floorGeometry = new THREE.PlaneGeometry(size, size);

    this.mesh = new THREE.Mesh(floorGeometry);
    this.mesh.name = "floor";
    this.mesh.rotation.x = -Math.PI / 2;
    this.add(this.mesh);

    this.grid = new THREE.GridHelper(
      size,
      size,
      new THREE.Color("#888888"),
      new THREE.Color("#888888")
    );
    this.grid.position.y = 0.01;
    this.grid.material.opacity = 0.35;
    this.grid.material.transparent = true;

    this.setPlainFloor(new THREE.Color("#2a6e3c"));

    // Maybe disable lights when switching to water floor?
    // this.setWaterFloor();
  }

  setPlainFloor(color: THREE.Color) {
    this.mesh.material = new THREE.MeshBasicMaterial({
      color,
    });
    this.add(this.grid);
  }

  setGrassFloor() {
    this.mesh.material = new THREE.MeshBasicMaterial({
      map: grassTexture,
    });
    this.add(this.grid);
  }

  setWaterFloor() {
    this.water = new Water(this.mesh.geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: true,
    });

    this.water.rotation.x = -Math.PI / 2;

    this.add(this.water);

    const sky = new Sky();
    sky.scale.setScalar(10000);
    this.add(sky);
    const skyUniforms = sky.material.uniforms;

    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const parameters = {
      elevation: 2,
      azimuth: 180,
    };

    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    const sun = new THREE.Vector3();

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    this.water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    const sceneEnv = new THREE.Scene();
    sceneEnv.add(sky);
    const pmremGenerator = new THREE.PMREMGenerator(this.viewer.renderer);
    const renderTarget = pmremGenerator.fromScene(sceneEnv);
    this.add(sky);

    this.viewer.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.viewer.renderer.toneMappingExposure = 0.5;

    this.viewer.scene.environment = renderTarget.texture;
  }

  update() {
    if (this.water) this.water.material.uniforms["time"].value += 1.0 / 60.0;
  }
}
