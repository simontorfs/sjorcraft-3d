import { Box } from "@mui/material";
import React from "react";
import QuickButton from "./buildingBlocks/quickButton";
import { useDeviceSize } from "../src/hooks/useDeviceSize";

type SjorcraftCanvasProps = {
  parameterObject: {
    isLightMode: boolean;
    toggleLightmode: () => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    floorColor: string;
    setFloorColor: (color: string) => void;
    isGrassTexture: boolean;
    toggleFloorTexture: () => void;
    exportLashings: boolean;
    toggleExportLashings: () => void;
    openDisclaimer?: boolean;
    toggleDisclaimer?: (open: boolean) => void;
  };
};

export const SjorcraftCanvas = ({ parameterObject }: SjorcraftCanvasProps) => {
  const { smDevice } = useDeviceSize();
  return (
    <Box
      id="render_area"
      sx={{
        height: "100%",
        width: { xs: "100%", md: "calc(100% - 25rem)" },
        zIndex: 0,
        outline: "none",
        position: "relative",
      }}
    >
      {!smDevice && (
        <QuickButton toggleDisclaimer={parameterObject.toggleDisclaimer} />
      )}
    </Box>
  );
};

export default SjorcraftCanvas;
