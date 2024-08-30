import ArrowIcon from "../assets/icons/arrow.svg?react";
import BipodIcon from "../assets/icons/bipod.svg?react";
import PoleIcon from "../assets/icons/pole.svg?react";
import TripodIcon from "../assets/icons/tripod.svg?react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AxeIcon from "../assets/icons/axe.svg?react";
import React, { useContext, useState } from "react";
import { Tool } from "./ToolbarItem";
import { RendererContext } from "../contexts/rendererContext";
import { Box, Typography } from "@mui/material";

type ToolbarType = {
  isLightMode: boolean;
  toggleLightMode: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

const Toolbar = ({
  isLightMode,
  toggleLightMode,
  isSidebarOpen,
  toggleSidebar,
}: ToolbarType) => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;
  const [selectedTool, setSelectedTool] = useState("selectiontool");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        justifySelf: "center",
        alignItems: "center",
        padding: "0.5rem 2rem",
        fontWeight: "bold",
        fontSize: "x-large",
        height: "3.5rem",
      }}
      bgcolor="primary.main"
      color="primary.contrastText"
      component="nav"
    >
      <Typography
        variant="h5"
        component="p"
        sx={{
          fontWeight: "bold",
        }}
      >
        SjorCRAFT
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "left",
          gap: "1rem",
          width: "45%",
          padding: "0",
        }}
      >
        <Tool
          style={{ margin: "0 50px 0 0" }}
          active={selectedTool === "selectiontool"}
          disabled={false}
          icon={ArrowIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("selectiontool");
            setSelectedTool("selectiontool");
          }}
        />
        <Tool
          active={selectedTool === "poletool"}
          disabled={false}
          icon={PoleIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("poletool");
            setSelectedTool("poletool");
          }}
        />
        <Tool
          active={selectedTool === "bipodtool"}
          disabled={false}
          icon={BipodIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("bipodtool");
            setSelectedTool("bipodtool");
          }}
        />
        <Tool
          active={selectedTool === "tripodtool"}
          disabled={false}
          icon={TripodIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("tripodtool");
            setSelectedTool("tripodtool");
          }}
        />
        <Tool
          active={selectedTool === "destructiontool"}
          disabled={false}
          icon={AxeIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("destructiontool");
            setSelectedTool("destructiontool");
          }}
        />
      </Box>
      <Box
        component={"div"}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "right",
          justifyItems: "right",
          justifySelf: "center",
          alignContent: "center",
          alignItems: "center",
          gap: "1rem",
          width: "20%",
          height: "100%",
          padding: "0.3rem",
        }}
      >
        {isLightMode ? (
          <DarkModeIcon
            sx={{
              cursor: "pointer",
              fontSize: "2rem",
              "&:hover": {
                color: "secondary.main",
              },
            }}
            onClick={() => {
              toggleLightMode();
            }}
          />
        ) : (
          <LightModeIcon
            sx={{
              cursor: "pointer",
              fontSize: "2rem",
              "&:hover": {
                color: "secondary.main",
              },
            }}
            onClick={() => {
              toggleLightMode();
            }}
          />
        )}
        {isSidebarOpen ? (
          <CloseIcon
            sx={{
              cursor: "pointer",
              fontSize: "2rem",
              "&:hover": {
                color: "secondary.main",
              },
            }}
            onClick={() => {
              toggleSidebar();
            }}
          />
        ) : (
          <MenuIcon
            sx={{
              cursor: "pointer",
              fontSize: "2rem",
              "&:hover": { color: "secondary.main" },
            }}
            onClick={() => {
              toggleSidebar();
            }}
          />
        )}
      </Box>
    </Box>
  );
};
export default Toolbar;
