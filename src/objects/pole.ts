import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { PoleSetManager } from "../poleSet";

const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load("/textures/wood/v1/wood_basecolor.jpg");
const heightTexture = textureLoader.load("/textures/wood/v1/wood_height.png");
const normalTexture = textureLoader.load("/textures/wood/v1/wood_normal.jpg");
const roughnessTexture = textureLoader.load(
  "/textures/wood/v1/wood_roughness.jpg"
);
const aoTexture = textureLoader.load("/textures/wood/v1/wood_ao.jpg");

colorTexture.wrapT = THREE.MirroredRepeatWrapping;
heightTexture.wrapT = THREE.MirroredRepeatWrapping;
normalTexture.wrapT = THREE.MirroredRepeatWrapping;
roughnessTexture.wrapT = THREE.MirroredRepeatWrapping;
aoTexture.wrapT = THREE.MirroredRepeatWrapping;

export class Pole extends THREE.Object3D {
  identifier: string;
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

  constructor(identifier?: string) {
    super();
    this.identifier = identifier || uuidv4();

    const geometry = new THREE.CylinderGeometry(
      this.radius,
      this.radius,
      this.length
    );
    const material = new THREE.MeshStandardMaterial({
      map: colorTexture.clone(),
      roughnessMap: roughnessTexture.clone(),
      normalMap: normalTexture.clone(),
      aoMap: aoTexture.clone(),
      metalness: 0.2,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    // Caps
    const capGeometry = new THREE.CylinderGeometry(
      this.radius + this.capOffset,
      this.radius + this.capOffset,
      this.capLength
    );
    const capMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.5,
    });
    this.capTop = new THREE.Mesh(capGeometry, capMaterial);
    this.capBottom = new THREE.Mesh(capGeometry, capMaterial);
    this.setPositionCaps();

    this.add(this.capTop);
    this.add(this.capBottom);
    this.add(this.mesh);

    this.direction = new THREE.Vector3(0, 1, 0);
    this.updateMaterialsAfterLengthChange();
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
    const poleSet = PoleSetManager.getInstance();
    const allowedLengths = poleSet.getAllowedPoleLengths();
    const colors = poleSet.getPoleColors();
    // if the lenth is too big, just set it to the biggest length
    this.length = allowedLengths.at(-1);
    this.color = colors.at(-1);

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
    this.updateMaterialsAfterLengthChange();
    this.setPositionCaps();
  }

  updateMaterialsAfterLengthChange() {
    // @ts-ignore
    this.mesh.material.map.repeat.y = this.length * 2;
    // @ts-ignore
    this.mesh.material.roughnessMap.repeat.y = this.length * 2;
    // @ts-ignore
    this.mesh.material.normalMap.repeat.y = this.length * 2;
    // @ts-ignore
    this.mesh.material.aoMap.repeat.y = this.length * 2;
    // @ts-ignore
    this.capBottom.material.color = this.color;
    // @ts-ignore
    this.capTop.material.color = this.color;
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
      return {
        closestPoint: new THREE.Vector3(),
        closestPointOnOtherPole: new THREE.Vector3(1, 0, 0),
      }; // TODO: implement this
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

  getRadialDistanceToParallelPole(otherPole: Pole) {
    if (!this.isParallelTo(otherPole.direction)) {
      throw new Error("Poles are not parallel");
    }
    const AB = this.position.clone().sub(otherPole.position);
    const normalDirection = AB.clone().cross(this.direction);

    if (!normalDirection.length()) return 0; // The poles are collinear. Radial distance is 0.

    const radialDirection = normalDirection
      .clone()
      .cross(this.direction)
      .normalize();
    return Math.abs(AB.dot(radialDirection));
  }

  hasProjection(point: THREE.Vector3) {
    return (
      this.getProjectedPoint(point).distanceTo(this.position) < this.length / 2
    );
  }

  getProjectedPoint(point: THREE.Vector3) {
    const v = new THREE.Vector3().subVectors(point, this.position);
    const projectionLength = v.dot(this.direction);
    return this.position
      .clone()
      .add(this.direction.clone().multiplyScalar(projectionLength));
  }
}
