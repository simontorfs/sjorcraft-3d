import { Viewer } from "./viewer";
import GUI from "lil-gui";

export class Debug {
  viewer: Viewer;
  active: boolean;
  gui: GUI;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.active = window.location.hash === "#debug";
    if (!this.active) return;

    this.gui = new GUI();

    const guiElement = document.querySelector(".lil-gui") as HTMLElement;
    guiElement.style.width = "150px";
    guiElement.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });
    guiElement.addEventListener("mouseup", (event) => {
      const activeElement = document.activeElement as HTMLElement;
      activeElement.blur();
    });

    this.gui
      .add(
        {
          trigger: () =>
            this.viewer.inputHandler.onActivateTool("selectiontool"),
        },
        "trigger"
      )
      .name("Selection");

    this.gui
      .add(
        {
          trigger: () => this.viewer.inputHandler.onActivateTool("poletool"),
        },
        "trigger"
      )
      .name("Pole");

    this.gui
      .add(
        {
          trigger: () => this.viewer.inputHandler.onActivateTool("bipodtool"),
        },
        "trigger"
      )
      .name("Bipod");

    this.gui
      .add(
        {
          trigger: () => this.viewer.inputHandler.onActivateTool("tripodtool"),
        },
        "trigger"
      )
      .name("Tripod");

    this.gui
      .add(
        {
          trigger: () =>
            this.viewer.inputHandler.onActivateTool("polypedestratool"),
        },
        "trigger"
      )
      .name("Polypedestra");

    this.gui
      .add(
        {
          trigger: () =>
            this.viewer.inputHandler.onActivateTool("destructiontool"),
        },
        "trigger"
      )
      .name("Destruction");

    this.gui
      .add(
        {
          trigger: () => this.viewer.inputHandler.onActivateTool("lashingtool"),
        },
        "trigger"
      )
      .name("Lashing");
  }
}
