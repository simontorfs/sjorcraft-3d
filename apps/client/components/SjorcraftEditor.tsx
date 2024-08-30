// add sjorcraftcanvas with a right panel that is collapsable
import React, { useEffect } from "react";
import { SjorcraftCanvas } from "./SjorcraftCanvas";
import Toolbar from "./Toolbar";
import { Viewer } from "../../3d/src/viewer";
import {
  RendererContext,
  RendererContextType,
} from "../contexts/rendererContext";
import EditorSidebar from "./EditorSidebar";
import { useDeviceSize } from "../src/hooks/useDeviceSize";

type SjorcraftEditorProps = {
  parameterObject: {
    isLightMode: boolean;
    toggleLightmode: () => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    floorColor: string;
    setFloorColor: (color: string) => void;
    isGrassTexture: boolean;
    toggleFloorTexture: () => void;
  };
};
const SjorcraftEditor = ({ parameterObject }: SjorcraftEditorProps) => {
  const [rendererContext, setRendererContext] =
    React.useState<RendererContextType>({});

  let initialised = false;
  useEffect(() => {
    if (initialised) return;
    const element = document.getElementById("render_area");
    if (!element) return;

    const viewer = new Viewer(element);
    setRendererContext({ viewer });

    initialised = true;
  }, []);

  const { smDevice } = useDeviceSize();

  return (
    <div className="sjorcraft-editor">
      <RendererContext.Provider value={rendererContext}>
        {!smDevice && (
          <Toolbar
            isLightMode={parameterObject.isLightMode}
            toggleLightMode={parameterObject.toggleLightmode}
            isSidebarOpen={parameterObject.isSidebarOpen}
            toggleSidebar={parameterObject.toggleSidebar}
          />
        )}
        <div className="editor-main-content">
          <SjorcraftCanvas />
          {!smDevice && <EditorSidebar parameterObject={parameterObject} />}
        </div>
      </RendererContext.Provider>
    </div>
  );
};

export default SjorcraftEditor;
