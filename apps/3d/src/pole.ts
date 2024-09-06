import * as THREE from "three";

export const allowedLengths: number[] = [
  1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0,
];
export const colors: THREE.Color[] = [
  new THREE.Color(0xffa500),
  new THREE.Color(0x00ff00),
  new THREE.Color(0xff0000),
  new THREE.Color(0x037c6e),
  new THREE.Color(0xffffff),
  new THREE.Color(0x0000ff),
  new THREE.Color(0xffff00),
  new THREE.Color(0x000000),
];

export class Pole extends THREE.Object3D {
  mesh: THREE.Mesh;
  capTop: THREE.Mesh;
  capBottom: THREE.Mesh;
  direction: THREE.Vector3;
  length: number = 4.0;
  radius: number = 0.06;
  capLength: number = 0.1;
  capOffset: number = 0.001; //makes the render look great
  color: THREE.Color = new THREE.Color(0x0000ff);
  selected: Boolean = false;

  constructor() {
    super();
    const textureLoader = new THREE.TextureLoader();
    const colorTexture = textureLoader.load(
      "./textures/wood/v1/wood_basecolor.jpg"
    );
    colorTexture.repeat.y = this.length * 2;
    colorTexture.wrapT = THREE.MirroredRepeatWrapping;
    const heightTexture = textureLoader.load(
      "./textures/wood/v1/wood_height.png"
    );
    const normalTexture = textureLoader.load(
      "./textures/wood/v1/wood_normal.jpg"
    );
    const roughnessTexture = textureLoader.load(
      "./textures/wood/v1/wood_roughness.jpg"
    );
    const metalnessTexture = textureLoader.load(
      "./textures/wood/v1/wood_height.png"
    );
    const aoTexture = textureLoader.load("./textures/wood/v1/wood_ao.jpg");

    const geometry = new THREE.CylinderGeometry(
      this.radius,
      this.radius,
      this.length
    );
    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      roughnessMap: roughnessTexture,
      metalnessMap: metalnessTexture,
      normalMap: normalTexture,
      aoMap: aoTexture,
      metalness: 0.2,
      roughness: 1,
      wireframe: false,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    // Create top and bottom caps meshes
    const capGeometry = new THREE.CylinderGeometry(
      this.radius + this.capOffset,
      this.radius + this.capOffset,
      this.capLength
    );
    const capMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.5,
    }); // Blue color
    this.capTop = new THREE.Mesh(capGeometry, capMaterial);
    this.capBottom = new THREE.Mesh(capGeometry, capMaterial);
    this.setPositionCaps();

    // Add top and bottom caps to the pole
    this.add(this.capTop);
    this.add(this.capBottom);
    this.add(this.mesh);

    this.direction = new THREE.Vector3(0, 1, 0);
  }

  loadFromJson(pole: any) {
    this.position.set(pole.position.x, pole.position.y, pole.position.z);
    this.setDirection(
      new THREE.Vector3(pole.direction.x, pole.direction.y, pole.direction.z)
    );
    this.name = pole.name;
    this.setLength(pole.length);
    this.rotation.set(pole.rotation._x, pole.rotation._y, pole.rotation._z);
    this.uuid = pole.uuid;
  }

  saveToJson() {
    return {
      position: this.position,
      direction: this.direction,
      name: this.name,
      mesh: this.mesh.position,
      rotation: this.rotation,
      length: this.length,
      uuid: this.uuid,
    };
  }

  setDirection(direction: THREE.Vector3) {
    this.direction = direction.clone().normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);
    this.setRotationFromQuaternion(quaternion);
  }

  setLength(minimumLength: number) {
    // if the lenth is to big, just set it to the biggest lenght
    this.length = allowedLengths[allowedLengths.length - 1];
    this.color = colors[colors.length - 1];

    for (let i = 0; i < allowedLengths.length; i++) {
      const length = allowedLengths[i];
      if (length >= minimumLength) {
        this.length = length;
        this.color = colors[i];
        break;
      }
    }
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.CylinderGeometry(
      this.radius,
      this.radius,
      this.length
    );
    // @ts-ignore
    this.mesh.material.map.repeat.y = this.length * 2;
    // @ts-ignore
    this.capBottom.material.color = this.color;
    // @ts-ignore
    this.capTop.material.color = this.color;
    this.setPositionCaps();
  }

  setPositionCaps() {
    (this.capBottom.position.y =
      -(this.length - this.capLength) / 2 - this.capOffset),
      (this.capTop.position.y =
        (this.length - this.capLength) / 2 + this.capOffset);
  }

  select() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(0, 1, 1);
    this.selected = true;
  }

  deselect() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(1, 1, 1);
    this.selected = false;
  }

  threatenWithDestruction() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(1, 0.5, 0);
  }

  stopThreatening() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(1, 1, 1);
  }

  isParallelTo(direction: THREE.Vector3) {
    const angle = direction.angleTo(this.direction);
    if (angle < 0) console.log("IS THIS LEGAL????");
    return angle < 0.01;
  }

  isVertical() {
    return this.isParallelTo(new THREE.Vector3(0, 1, 0));
  }

  overlaps(otherPole: Pole) {
    const { closestPoint, closestPointOnOtherPole } =
      this.getClosestApproach(otherPole);
    if (!closestPoint || !closestPointOnOtherPole) return false;

    const poleSeparation = closestPoint
      .clone()
      .sub(closestPointOnOtherPole)
      .length();

    const collision = poleSeparation < 0.9 * (this.radius + otherPole.radius);
    return collision;
  }

  getClosestApproach(otherPole: Pole) {
    const p1 = this.position
      .clone()
      .sub(this.direction.clone().multiplyScalar(this.length / 2));

    const p2 = otherPole.position
      .clone()
      .sub(otherPole.direction.clone().multiplyScalar(otherPole.length / 2));

    const v12 = new THREE.Vector3().subVectors(p1, p2);

    const d2 = otherPole.direction.clone().multiplyScalar(otherPole.length);
    const d1 = this.direction.clone().multiplyScalar(this.length);

    const d1343 = v12.dot(d2);
    const d4321 = d2.dot(d1);
    const d1321 = v12.dot(d1);
    const d4343 = d2.dot(d2);
    const d2121 = d1.dot(d1);

    const denom = d2121 * d4343 - d4321 * d4321;
    if (Math.abs(denom) < Number.EPSILON) {
      // The poles are parallel
      return { closestPoint: undefined, closestPointOnOtherPole: undefined }; // TODO: implement this
    }

    const numer = d1343 * d4321 - d1321 * d4343;
    let mu1 = numer / denom;
    if (mu1 > 1) mu1 = 1;
    if (mu1 < 0) mu1 = 0;
    let mu2 = (d1343 + d4321 * mu1) / d4343;
    if (mu2 > 1) mu2 = 1;
    if (mu2 < 0) mu2 = 0;

    const closestPoint1 = new THREE.Vector3()
      .copy(p1)
      .add(d1.multiplyScalar(mu1));
    const closestPoint2 = new THREE.Vector3()
      .copy(p2)
      .add(d2.multiplyScalar(mu2));

    return {
      closestPoint: closestPoint1,
      closestPointOnOtherPole: closestPoint2,
    };
  }
}
