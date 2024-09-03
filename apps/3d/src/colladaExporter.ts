import * as THREE from "three";

export class ColladaExporter {
  private scene: THREE.Scene;

  constructor() {
    // Leeg laten, de scene wordt in parse() gezet
  }

  public parse(scene: THREE.Scene): string {
    this.scene = scene;
    const xmlParts: string[] = [];

    xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlParts.push(
      '<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">'
    );

    xmlParts.push("<asset>");
    xmlParts.push(
      "<contributor><authoring_tool>Three.js Collada Exporter</authoring_tool></contributor>"
    );
    xmlParts.push("<created>" + new Date().toISOString() + "</created>");
    xmlParts.push("<modified>" + new Date().toISOString() + "</modified>");
    xmlParts.push('<unit name="meter" meter="1"/>');
    xmlParts.push("<up_axis>Y_UP</up_axis>");
    xmlParts.push("</asset>");

    xmlParts.push("<library_geometries>");
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name !== "floor") {
        this.addGeometry(xmlParts, child);
      }
    });
    xmlParts.push("</library_geometries>");

    xmlParts.push("<library_visual_scenes>");
    xmlParts.push('<visual_scene id="Scene" name="Scene">');
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name !== "floor") {
        this.addNode(xmlParts, child);
      }
    });
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

    // Positions
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

    // Indices
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

    // Verkrijg de wereldmatrix om transformaties toe te passen
    const matrix = new THREE.Matrix4();
    mesh.updateMatrixWorld(true);
    matrix.copy(mesh.matrixWorld);

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);

    // Converteer de quaternion naar een Euler om de rotaties in graden te verkrijgen
    const rotation = new THREE.Euler().setFromQuaternion(quaternion);

    xmlParts.push(`<node id="node_${id}" name="${mesh.name}">`);

    // Transformations
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
}
