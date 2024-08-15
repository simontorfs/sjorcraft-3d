import * as THREE from "three";
import { Viewer } from "./viewer";

export class ImageExporter {
  viewer: Viewer;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(500, 500);
    document.body.appendChild(this.renderer.domElement);
  }

  render() {
    requestAnimationFrame(this.render);
    this.renderer.render(this.viewer.scene, this.camera);
  }

  exportImage() {
    // Setting the scene
    const boundingBox = new THREE.Box3();
    this.viewer.poleInventory.poles.forEach((obj) => {
      const objBoundingBox = new THREE.Box3().setFromObject(obj);
      boundingBox.union(objBoundingBox);
    });
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim / Math.tan((Math.PI * this.camera.fov) / 360);

    const views: string[] = ["front", "back", "left", "right", "top"];
    const tileSize: number = 500;

    // Create a new HTML page dynamically
    let newPageContent: string = ` <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Multi View Images</title>
      <style>
        .image-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          text-align: center;
          margin-top: 20px;
        }
        .image-container img {
          width: 30%;
          margin: 10px;
        }
        .image-label {
          margin-top: 10px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
  `;

    views.forEach((view: string, index: number) => {
      // Set camera position and look at center of the scene for each view
      switch (view) {
        case "front":
          this.camera.position.copy(center);
          this.camera.position.z += distance;
          break;
        case "back":
          this.camera.position.copy(center);
          this.camera.position.z -= distance;
          break;
        case "left":
          this.camera.position.copy(center);
          this.camera.position.x -= distance;
          break;
        case "right":
          this.camera.position.copy(center);
          this.camera.position.x += distance;
          break;
        case "top":
          this.camera.position.copy(center);
          this.camera.position.y += distance;
          break;
        default:
          console.error("Invalid angle specified.");
          return;
      }

      this.camera.lookAt(center);
      this.renderer.render(this.viewer.scene, this.camera);

      const imgData: string = this.renderer.domElement.toDataURL("image/png");
      // Append image tag to the new page content
      newPageContent += `<div class="image-container">
                        <img src="${imgData}" alt="${view} view">
                        <div class="image-label">${view}</div>
                      </div>`;

      // const imgData = this.renderer.domElement.toDataURL("image/png");
      // const link = document.createElement("a");
      // link.download = `export_${view}_view.png`;
      // link.href = imgData;
      // link.click();
    });

    // Close the HTML content
    newPageContent += `
      </div>
    </body>
    </html>
  `;

    // Create a new window/tab and write the new page content
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(newPageContent);
    } else {
      console.error("Failed to open new window.");
    }
  }
}
