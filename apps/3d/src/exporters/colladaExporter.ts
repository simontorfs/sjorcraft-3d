import * as THREE from "three";
import { TObjectArray } from "../saveAndLoader";

export class ColladaExporter {
  public parse(objectArray: TObjectArray): string {
    const xmlParts: string[] = [];

    xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlParts.push(
      '<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">'
    );

    xmlParts.push("<asset>");
    xmlParts.push(
      "<contributor><authoring_tool>Created with SjorCraft</authoring_tool></contributor>"
    );
    xmlParts.push("<created>" + new Date().toISOString() + "</created>");
    xmlParts.push("<modified>" + new Date().toISOString() + "</modified>");
    xmlParts.push('<unit name="meter" meter="1"/>');
    xmlParts.push("<up_axis>Y_UP</up_axis>");
    xmlParts.push("</asset>");

    xmlParts.push("<library_geometries>");
    for (const obj of objectArray) {
      obj.traverseVisible((child) => {
        if (
          child instanceof THREE.Mesh &&
          ColladaExporter.isValidForExport(child)
        ) {
          this.addGeometry(xmlParts, child);
        }
      });
    }
    xmlParts.push("</library_geometries>");

    xmlParts.push("<library_visual_scenes>");
    xmlParts.push('<visual_scene id="Scene" name="Scene">');
    for (const obj of objectArray) {
      obj.traverseVisible((child) => {
        if (
          child instanceof THREE.Mesh &&
          ColladaExporter.isValidForExport(child)
        ) {
          this.addNode(xmlParts, child);
        }
      });
    }
    xmlParts.push("</visual_scene>");
    xmlParts.push("</library_visual_scenes>");

    xmlParts.push("<scene>");
    xmlParts.push('<instance_visual_scene url="#Scene"/>');
    xmlParts.push("</scene>");

    xmlParts.push("</COLLADA>");

    return xmlParts.join("\n");
  }

  private addGeometry(xmlParts: string[], mesh: THREE.Mesh) {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const id = mesh.uuid;

    xmlParts.push(`<geometry id="geometry_${id}" name="${mesh.name}">`);
    xmlParts.push("<mesh>");

    const position = geometry.getAttribute("position");
    xmlParts.push('<source id="positions_' + id + '">');
    xmlParts.push(
      '<float_array id="positions_' +
        id +
        '_array" count="' +
        position.count * 3 +
        '">'
    );
    xmlParts.push(Array.from(position.array).join(" "));
    xmlParts.push("</float_array>");
    xmlParts.push("<technique_common>");
    xmlParts.push(
      '<accessor source="#positions_' +
        id +
        '_array" count="' +
        position.count +
        '" stride="3">'
    );
    xmlParts.push('<param name="X" type="float"/>');
    xmlParts.push('<param name="Y" type="float"/>');
    xmlParts.push('<param name="Z" type="float"/>');
    xmlParts.push("</accessor>");
    xmlParts.push("</technique_common>");
    xmlParts.push("</source>");

    const index = geometry.getIndex();
    xmlParts.push('<vertices id="vertices_' + id + '">');
    xmlParts.push(
      '<input semantic="POSITION" source="#positions_' + id + '"/>'
    );
    xmlParts.push("</vertices>");

    if (index) {
      xmlParts.push('<triangles count="' + index.count / 3 + '">');
      xmlParts.push(
        '<input semantic="VERTEX" source="#vertices_' + id + '" offset="0"/>'
      );
      xmlParts.push("<p>" + Array.from(index.array).join(" ") + "</p>");
      xmlParts.push("</triangles>");
    }

    xmlParts.push("</mesh>");
    xmlParts.push("</geometry>");
  }

  private addNode(xmlParts: string[], mesh: THREE.Mesh) {
    const id = mesh.uuid;

    const matrix = new THREE.Matrix4();
    mesh.updateMatrixWorld(true);
    matrix.copy(mesh.matrixWorld);

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);

    const rotation = new THREE.Euler().setFromQuaternion(quaternion);

    xmlParts.push(`<node id="node_${id}" name="${mesh.name}">`);

    xmlParts.push(
      `<translate>${position.x} ${position.y} ${position.z}</translate>`
    );
    xmlParts.push(
      `<rotate>1 0 0 ${THREE.MathUtils.radToDeg(rotation.x)}</rotate>`
    );
    xmlParts.push(
      `<rotate>0 1 0 ${THREE.MathUtils.radToDeg(rotation.y)}</rotate>`
    );
    xmlParts.push(
      `<rotate>0 0 1 ${THREE.MathUtils.radToDeg(rotation.z)}</rotate>`
    );
    xmlParts.push(`<scale>${scale.x} ${scale.y} ${scale.z}</scale>`);

    xmlParts.push(`<instance_geometry url="#geometry_${id}">`);
    xmlParts.push("</instance_geometry>");
    xmlParts.push("</node>");
  }

  static isValidForExport(object) {
    if (
      object.visible === false ||
      ColladaExporter.hasGeometry(object) === false ||
      object.userData.isRaycasted === true ||
      object.name === "floor"
    ) {
      return false;
    }

    let currentObject = object;
    while (currentObject) {
      if (!currentObject.visible) return false;
      currentObject = currentObject.parent;
    }

    if (object.material) {
      if (Array.isArray(object.material)) {
        return object.material.some((mat) => mat.opacity > 0 && mat.visible);
      } else {
        return object.material.opacity > 0 && object.material.visible;
      }
    }

    return true;
  }

  static hasGeometry(object) {
    return (
      object.geometry &&
      object.geometry.attributes &&
      object.geometry.attributes.position
    );
  }
}
