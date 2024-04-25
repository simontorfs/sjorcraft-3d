import * as THREE from "three";

export class Pole extends THREE.Object3D {
  geometry: THREE.CylinderGeometry;
  material: THREE.MeshStandardMaterial;
  mesh: THREE.Mesh;
  direction: THREE.Vector3;
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
    this.direction = new THREE.Vector3(0, 1, 0);
  }

  setDirection(direction: THREE.Vector3) {
    this.direction = direction.normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);
    this.setRotationFromQuaternion(quaternion);
  }

  setPositionBetweenGroundAndPole(
    groundPoint: THREE.Vector3,
    polePoint: THREE.Vector3
  ) {
    this.position.set(groundPoint.x, groundPoint.y, groundPoint.z);
    const targetOrientationVector = polePoint.clone().sub(groundPoint.clone());
    this.setDirection(targetOrientationVector);
    this.mesh.position.y = 2.0;
  }

  select() {
    console.log("select");
  }
}
