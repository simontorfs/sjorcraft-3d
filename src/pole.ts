import * as THREE from "three";

export class Pole extends THREE.Object3D {
  geometry: THREE.CylinderGeometry;
  material: THREE.MeshStandardMaterial;
  mesh: THREE.Mesh;
  constructor() {
    super();
    const textureLoader = new THREE.TextureLoader();
    const colorTexture = textureLoader.load("./wood/Wood_025_basecolor.jpg");
    colorTexture.repeat.y = 8;
    colorTexture.wrapT = THREE.MirroredRepeatWrapping;
    const heightTexture = textureLoader.load("./wood/Wood_025_height.png");
    const normalTexture = textureLoader.load("./woord/Wood_025_normal.png");
    const roughnessTexture = textureLoader.load(
      "./wood/Wood_025_roughness.png"
    );

    this.geometry = new THREE.CylinderGeometry(0.07, 0.07, 4.0);
    this.material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      roughnessMap: roughnessTexture,
      normalMap: normalTexture,
      wireframe: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);
    this.mesh.rotation.y = Math.random() * 2 * Math.PI;
    this.mesh.position.y = 2;
    this.position.set(100, 100, 100);
  }

  select() {
    console.log("select");
  }
}
