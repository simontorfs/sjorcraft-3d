import * as THREE from "three";
import { Lashing } from "./lashing";

export class Pole extends THREE.Object3D {
  mesh: THREE.Mesh;
  direction: THREE.Vector3;
  length: number = 4.0;
  lashings: Lashing[] = [];
  constructor() {
    super();
    const textureLoader = new THREE.TextureLoader();
    const colorTexture = textureLoader.load("./wood/Wood_025_basecolor.jpg");
    colorTexture.repeat.y = this.length * 2;
    colorTexture.wrapT = THREE.MirroredRepeatWrapping;
    const heightTexture = textureLoader.load("./wood/Wood_025_height.png");
    const normalTexture = textureLoader.load("./woord/Wood_025_normal.png");
    const roughnessTexture = textureLoader.load(
      "./wood/Wood_025_roughness.png"
    );

    const geometry = new THREE.CylinderGeometry(0.07, 0.07, this.length);
    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      roughnessMap: roughnessTexture,
      normalMap: normalTexture,
      wireframe: false,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.y = Math.random() * 2 * Math.PI;
    this.add(this.mesh);
    this.direction = new THREE.Vector3(0, 1, 0);
  }

  setDirection(direction: THREE.Vector3) {
    this.direction = direction.clone().normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);
    this.setRotationFromQuaternion(quaternion);
  }

  setPositionOnGround(position: THREE.Vector3) {
    this.position.set(position.x, position.y, position.z);
    this.mesh.position.set(0, 2, 0);
    this.setDirection(new THREE.Vector3(0, 1, 0));
  }

  setPositionBetweenGroundAndPole(
    groundPoint: THREE.Vector3,
    polePoint: THREE.Vector3
  ) {
    this.position.set(groundPoint.x, groundPoint.y, groundPoint.z);
    const targetOrientationVector = polePoint.clone().sub(groundPoint.clone());
    const distance = targetOrientationVector.length();
    this.setLength(distance + 0.15);
    this.setDirection(targetOrientationVector);
    this.mesh.position.y = this.length / 2.0;
  }

  setPositionBetweenTwoPoles(pointA: THREE.Vector3, pointB: THREE.Vector3) {
    const centerPoint = pointA.clone().add(pointB.clone()).divideScalar(2.0);
    this.mesh.position.y = 0.0;
    this.position.set(centerPoint.x, centerPoint.y, centerPoint.z);
    const targetOrientationVector = pointB.clone().sub(pointA.clone());

    const distance = targetOrientationVector.length();
    this.setLength(distance + 0.3);
    this.setDirection(targetOrientationVector);
  }

  setLength(minimumLength: number) {
    const allowedLengths = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0];
    for (const length of allowedLengths) {
      if (length >= minimumLength) {
        this.length = length;
        break;
      }
    }
    if (minimumLength > 6.0) this.length = 6.0;
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.CylinderGeometry(0.07, 0.07, this.length);
    // @ts-ignore
    this.mesh.material.map.repeat.y = this.length * 2;
  }

  addLashing(lashing: Lashing) {
    this.lashings.push(lashing);
  }

  removeLashing(pole: Pole) {
    this.lashings = this.lashings.filter(
      (lashing) => lashing.fixedPole !== pole && lashing.loosePole !== pole
    );
  }

  select() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(0, 1, 1);
  }

  deselect() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(1, 1, 1);
  }
}
