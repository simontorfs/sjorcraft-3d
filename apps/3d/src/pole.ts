import * as THREE from "three";

export class Pole extends THREE.Object3D {
  mesh: THREE.Mesh;
  capTop: THREE.Mesh;
  capBottom: THREE.Mesh;
  direction: THREE.Vector3;
  length: number = 4.0;
  radius: number = 0.06;
  capLength: number = 0.2;
  capOffset: number = 0.001; //makes the render look great
  color: number = 0x0000ff;
  constructor() {
    super();
    const textureLoader = new THREE.TextureLoader();
    const colorTexture = textureLoader.load("./wood/Wood_025_basecolor.jpg");
    colorTexture.repeat.y = this.length * 2;
    colorTexture.wrapT = THREE.MirroredRepeatWrapping;
    const heightTexture = textureLoader.load("./wood/Wood_025_height.png");
    const normalTexture = textureLoader.load("./wood/Wood_025_normal.png");
    const roughnessTexture = textureLoader.load(
      "./wood/Wood_025_roughness.png"
    );

    const geometry = new THREE.CylinderGeometry(
      this.radius,
      this.radius,
      this.length
    );
    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      roughnessMap: roughnessTexture,
      normalMap: normalTexture,
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

  setPositionOnGround(position: THREE.Vector3) {
    this.position.set(position.x, position.y + this.length / 2.0, position.z);
    this.setDirection(new THREE.Vector3(0, 1, 0));
  }

  setPositionBetweenGroundAndPole(
    groundPoint: THREE.Vector3,
    polePoint: THREE.Vector3
  ) {
    const targetOrientationVector = polePoint.clone().sub(groundPoint.clone());
    const distance = targetOrientationVector.length();
    this.setLength(distance + 0.15);
    this.setDirection(targetOrientationVector);
    const targetPosition = groundPoint
      .clone()
      .add(this.direction.clone().multiplyScalar(this.length / 2.0));
    this.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
  }

  setPositionBetweenTwoPoles(pointA: THREE.Vector3, pointB: THREE.Vector3) {
    const centerPoint = pointA.clone().add(pointB.clone()).divideScalar(2.0);
    this.position.set(centerPoint.x, centerPoint.y, centerPoint.z);
    const targetOrientationVector = pointB.clone().sub(pointA.clone());
    const distance = targetOrientationVector.length();
    this.setLength(distance + 0.3);
    this.setDirection(targetOrientationVector);
  }

  setLength(minimumLength: number) {
    const allowedLengths: number[] = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0];
    const colors: number[] = [
      0xffa500, 0x00ff00, 0xff0000, 0x037c6e, 0xffffff, 0x0000ff, 0xffff00,
      0x000000,
    ];

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
    this.capBottom.material = new THREE.MeshStandardMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.5,
    });
    this.capTop.material = new THREE.MeshStandardMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.5,
    });
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
  }

  deselect() {
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
      return false; // TODO: implement this
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

    const poleSeparation = closestPoint1.clone().sub(closestPoint2).length();

    const collision = poleSeparation < 0.9 * (this.radius + otherPole.radius);
    return collision;
  }
}
