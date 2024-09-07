import { Pole } from "./pole";
import { SquareLashingCurve } from "./squareLashingCurve";
import * as THREE from "three";

export class Lashing extends THREE.Object3D {
  fixedPole: Pole;
  loosePole: Pole;
  centerFixedPole: THREE.Vector3;
  centerLoosePole: THREE.Vector3;
  anchorPoint: THREE.Vector3; // Point on the surface of the fixed pole where the user clicked
  anchorPointNormal: THREE.Vector3;
  fixedHeight: number | undefined;

  mesh: THREE.Mesh = new THREE.Mesh();
  constructor() {
    super();
  }

  setPropertiesFromAnchorPoint(
    fixedPole: Pole,
    loosePole: Pole,
    position: THREE.Vector3,
    normal: THREE.Vector3
  ) {
    this.fixedPole = fixedPole;
    this.loosePole = loosePole;
    this.anchorPoint = position;
    this.anchorPointNormal = normal;
    this.calculatePositions();
  }

  setPropertiesFromTwoPoles(pole1: Pole, pole2: Pole) {
    this.fixedPole = pole1;
    this.loosePole = pole2;

    const { closestPoint, closestPointOnOtherPole } =
      this.fixedPole.getClosestApproach(this.loosePole);

    this.centerFixedPole = closestPoint;
    this.centerLoosePole = closestPointOnOtherPole;

    const pos = this.centerFixedPole
      .clone()
      .add(this.centerLoosePole)
      .divideScalar(2.0);
    this.position.set(pos.x, pos.y, pos.z);
    this.updateMesh();
  }

  loadFromJson(lashing: any, poles: Pole[]) {
    const fixedPole: Pole | undefined = poles.find(
      (pole) => pole.uuid === lashing.fixedPole
    );
    const loosePole: Pole | undefined = poles.find(
      (pole) => pole.uuid === lashing.loosePole
    );
    if (fixedPole && loosePole && lashing.position) {
      this.fixedPole = fixedPole;
      this.loosePole = loosePole;
      this.centerFixedPole = new THREE.Vector3(
        lashing.centerFixedPole.x,
        lashing.centerFixedPole.y,
        lashing.centerFixedPole.z
      );
      this.centerLoosePole = new THREE.Vector3(
        lashing.centerLoosePole.x,
        lashing.centerLoosePole.y,
        lashing.centerLoosePole.z
      );
      this.position.set(
        lashing.position.x,
        lashing.position.y,
        lashing.position.z
      );
      this.updateMesh();
      return true;
    }
    console.log("Dropping lashing");
    return false;
  }

  saveToJson() {
    return {
      fixedPole: this.fixedPole.uuid,
      loosePole: this.loosePole.uuid,
      position: this.position,
      centerFixedPole: this.centerFixedPole,
      centerLoosePole: this.centerLoosePole,
    };
  }

  calculatePositions() {
    this.centerFixedPole = this.anchorPoint
      .clone()
      .sub(
        this.anchorPointNormal.clone().multiplyScalar(this.fixedPole.radius)
      );

    const centerDifference = new THREE.Vector3()
      .crossVectors(this.fixedPole.direction, this.loosePole.direction)
      .normalize()
      .multiplyScalar(this.fixedPole.radius + this.loosePole.radius);

    const centerLoosePoleOption1 = this.centerFixedPole
      .clone()
      .add(centerDifference);
    const centerLoosePoleOption2 = this.centerFixedPole
      .clone()
      .sub(centerDifference);
    const distanceOption1 = this.anchorPoint.distanceTo(centerLoosePoleOption1);
    const distanceOption2 = this.anchorPoint.distanceTo(centerLoosePoleOption2);

    if (distanceOption1 < distanceOption2) {
      this.centerLoosePole = centerLoosePoleOption1;
    } else {
      this.centerLoosePole = centerLoosePoleOption2;
    }

    if (this.fixedHeight) {
      this.snapLoosePole(this.fixedHeight);
    }

    const pos = this.centerLoosePole
      .clone()
      .add(this.centerFixedPole)
      .divideScalar(2.0);
    this.position.set(pos.x, pos.y, pos.z);
  }

  updateMesh() {
    this.remove(this.mesh);
    const path = new SquareLashingCurve(
      this.fixedPole.direction,
      this.centerFixedPole,
      this.loosePole.direction,
      this.centerLoosePole,
      this.position
    );
    const tubePoints = path.getSpacedPoints(200);
    const geometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(tubePoints),
      720,
      0.003,
      8,
      true
    );

    // Aanpassen van UV-coördinaten op basis van de curve-lengte
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox.getSize(size); // Haal de grootte op van de bounding box

    const uvAttribute = geometry.getAttribute("uv");

    if (uvAttribute instanceof THREE.BufferAttribute) {
      // Alleen verwerken als het een BufferAttribute is
      for (let i = 0; i < uvAttribute.count; i++) {
        const uv = new THREE.Vector2().fromBufferAttribute(uvAttribute, i);
        uv.y = uv.y * size.y; // Normeer de UV-coördinaten langs de Y-as om rekening te houden met de lengte van de lashing
        uvAttribute.setXY(i, uv.x, uv.y);
      }
      geometry.attributes.uv.needsUpdate = true;
    } else {
      console.warn(
        "UV attribute is not a BufferAttribute, skipping UV update."
      );
    }

    const textureLoader = new THREE.TextureLoader();
    const colorTexture = textureLoader.load("./textures/rope/rope_color5.jpg");
    colorTexture.repeat.set(78, 1); // Verhoog de repeat-waarde voor langere lashings
    colorTexture.wrapS = THREE.RepeatWrapping;
    colorTexture.wrapT = THREE.MirroredRepeatWrapping;
    colorTexture.anisotropy = 64;

    const material = new THREE.MeshStandardMaterial({
      color: 0x9e9578,
      wireframe: false,
      map: colorTexture,
      roughness: 1,
      metalness: 0.2,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);
  }

  snapLoosePole(desiredHeight: number) {
    // Move the center of the loose pole along the fixed pole direction until it is on the desired height.
    const heightDifference = this.centerLoosePole.y - desiredHeight;
    const translationDistance = heightDifference / this.fixedPole.direction.y;
    if (Math.abs(translationDistance) < 0.1 || this.fixedHeight) {
      const translationVector = this.fixedPole.direction
        .clone()
        .multiplyScalar(translationDistance);
      this.centerLoosePole.sub(translationVector);
      this.centerFixedPole.sub(translationVector);
      this.position.sub(translationVector);
      return true;
    }
    return false;
  }

  threatenWithDestruction() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(0x996209);
  }

  stopThreatening() {
    // @ts-ignore
    this.mesh.material.color = new THREE.Color(0x9e9578);
  }
}
