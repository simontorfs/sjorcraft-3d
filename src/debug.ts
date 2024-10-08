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

    const triggers = {
      selection: () => this.viewer.inputHandler.onActivateTool("selectiontool"),
      pole: () => this.viewer.inputHandler.onActivateTool("poletool"),
      bipod: () => this.viewer.inputHandler.onActivateTool("bipodtool"),
      tripod: () => this.viewer.inputHandler.onActivateTool("tripodtool"),
      polypedestra: () =>
        this.viewer.inputHandler.onActivateTool("polypedestratool"),
      destruction: () =>
        this.viewer.inputHandler.onActivateTool("destructiontool"),
      lashing: () => this.viewer.inputHandler.onActivateTool("lashingtool"),
    };

    this.gui.add(triggers, "selection").name("Selection");
    this.gui.add(triggers, "pole").name("Pole");
    this.gui.add(triggers, "bipod").name("Bipod");
    this.gui.add(triggers, "tripod").name("Tripod");
    this.gui.add(triggers, "polypedestra").name("Polypedestra");
    this.gui.add(triggers, "destruction").name("Destruction");
    this.gui.add(triggers, "lashing").name("Lashing");
  }
}
