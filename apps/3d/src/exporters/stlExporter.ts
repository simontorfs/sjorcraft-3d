import { Vector3 } from "three";

class STLExporter {
  parse(scene, options) {
    options = Object.assign(
      {
        binary: false,
      },
      options
    );

    const binary = options.binary;
    const objects = [];
    let triangles = 0;

    scene.traverse((object) => {
      if (
        STLExporter.isValidForExport(object) &&
        object.isMesh &&
        object.geometry &&
        object.name !== "floor" &&
        object.visible === true
      ) {
        const geometry = object.geometry;
        const index = geometry.index;
        const positionAttribute = geometry.getAttribute("position");

        triangles +=
          index !== null ? index.count / 3 : positionAttribute.count / 3;

        objects.push({
          object3d: object,
          geometry: geometry,
        });
      }
    });

    let output;
    let offset = 80; // skip header

    if (binary === true) {
      const bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
      const arrayBuffer = new ArrayBuffer(bufferLength);
      output = new DataView(arrayBuffer);
      output.setUint32(offset, triangles, true);
      offset += 4;
    } else {
      output = "";
      output += "solid exported\n";
    }

    const vA = new Vector3();
    const vB = new Vector3();
    const vC = new Vector3();
    const cb = new Vector3();
    const ab = new Vector3();
    const normal = new Vector3();

    for (let i = 0, il = objects.length; i < il; i++) {
      const object = objects[i].object3d;
      const geometry = objects[i].geometry;

      const index = geometry.index;
      const positionAttribute = geometry.getAttribute("position");

      if (index !== null) {
        for (let j = 0; j < index.count; j += 3) {
          const a = index.getX(j + 0);
          const b = index.getX(j + 1);
          const c = index.getX(j + 2);

          writeFace(a, b, c, positionAttribute, object);
        }
      } else {
        for (let j = 0; j < positionAttribute.count; j += 3) {
          const a = j + 0;
          const b = j + 1;
          const c = j + 2;

          writeFace(a, b, c, positionAttribute, object);
        }
      }
    }

    if (binary === false) {
      output += "endsolid exported\n";
    }

    return output;

    function writeFace(a, b, c, positionAttribute, object) {
      vA.fromBufferAttribute(positionAttribute, a);
      vB.fromBufferAttribute(positionAttribute, b);
      vC.fromBufferAttribute(positionAttribute, c);

      if (object.isSkinnedMesh === true) {
        object.applyBoneTransform(a, vA);
        object.applyBoneTransform(b, vB);
        object.applyBoneTransform(c, vC);
      }

      vA.applyMatrix4(object.matrixWorld);
      vB.applyMatrix4(object.matrixWorld);
      vC.applyMatrix4(object.matrixWorld);

      swapYAndZ(vA);
      swapYAndZ(vB);
      swapYAndZ(vC);

      writeNormal(vA, vB, vC);

      writeVertex(vA);
      writeVertex(vB);
      writeVertex(vC);

      if (binary === true) {
        output.setUint16(offset, 0, true);
        offset += 2;
      } else {
        output += "\t\tendloop\n";
        output += "\tendfacet\n";
      }
    }

    function writeNormal(vA, vB, vC) {
      cb.subVectors(vC, vB);
      ab.subVectors(vA, vB);
      cb.cross(ab).normalize();

      normal.copy(cb).normalize();

      if (binary === true) {
        output.setFloat32(offset, normal.x, true);
        offset += 4;
        output.setFloat32(offset, normal.y, true);
        offset += 4;
        output.setFloat32(offset, normal.z, true);
        offset += 4;
      } else {
        output +=
          "\tfacet normal " + normal.x + " " + normal.y + " " + normal.z + "\n";
        output += "\t\touter loop\n";
      }
    }

    function writeVertex(vertex) {
      if (binary === true) {
        output.setFloat32(offset, vertex.x, true);
        offset += 4;
        output.setFloat32(offset, vertex.y, true);
        offset += 4;
        output.setFloat32(offset, vertex.z, true);
        offset += 4;
      } else {
        output +=
          "\t\t\tvertex " + vertex.x + " " + vertex.y + " " + vertex.z + "\n";
      }
    }

    function swapYAndZ(vertex) {
      const temp = vertex.y;
      vertex.y = vertex.z;
      vertex.z = temp;
    }
  }

  // Controleer of een object geldig is voor export
  static isValidForExport(object) {
    if (
      object.visible === false || // Object moet zichtbaar zijn
      STLExporter.hasGeometry(object) === false || // Object moet geometrie hebben
      object.userData.isRaycasted === true || // Moet geen geraycasted object zijn
      object.name === "floor" // Moet geen "floor" object zijn
    ) {
      return false;
    }

    // Controleer zichtbaarheid van ouderobjecten
    let currentObject = object;
    while (currentObject) {
      if (!currentObject.visible) return false; // Als een ouder onzichtbaar is, is het object onzichtbaar
      currentObject = currentObject.parent;
    }

    // Controleer of het materiaal zichtbaar is
    if (object.material) {
      if (Array.isArray(object.material)) {
        return object.material.some((mat) => mat.opacity > 0 && mat.visible);
      } else {
        return object.material.opacity > 0 && object.material.visible;
      }
    }

    return true;
  }

  // Controleer of een object geometrie heeft
  static hasGeometry(object) {
    return (
      object.geometry &&
      object.geometry.attributes &&
      object.geometry.attributes.position
    );
  }
}

export { STLExporter };
