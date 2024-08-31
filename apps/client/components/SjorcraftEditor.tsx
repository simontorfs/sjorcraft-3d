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
import { Box, Grid, Stack } from "@mui/material";

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
    <Box
      sx={{
        margin: "0",
        padding: "0",
        height: "100%",
        width: "100%",
      }}
    >
      <RendererContext.Provider value={rendererContext}>
        {!smDevice && (
          <Toolbar
            isLightMode={parameterObject.isLightMode}
            toggleLightMode={parameterObject.toggleLightmode}
            isSidebarOpen={parameterObject.isSidebarOpen}
            toggleSidebar={parameterObject.toggleSidebar}
          />
        )}
        <Box
          sx={{
            height: "calc(100vh - 3.5rem)",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            gap: "0rem",
          }}
        >
          <Stack
            direction={"row"}
            sx={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              gap: "0rem",
              flexWrap: "nowrap",
              justifyContent: "normal",
            }}
          >
            <SjorcraftCanvas />
            {!smDevice && parameterObject.isSidebarOpen && (
              <EditorSidebar parameterObject={parameterObject} />
            )}
          </Stack>
        </Box>
      </RendererContext.Provider>
    </Box>
  );
};

export default SjorcraftEditor;
