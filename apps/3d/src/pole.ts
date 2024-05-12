import * as THREE from "three";

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
    const colors: THREE.Color[] = [
      new THREE.Color(0xffa500),
      new THREE.Color(0x00ff00),
      new THREE.Color(0xff0000),
      new THREE.Color(0x037c6e),
      new THREE.Color(0xffffff),
      new THREE.Color(0x0000ff),
      new THREE.Color(0xffff00),
      new THREE.Color(0x000000),
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
}
