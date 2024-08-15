import ArrowIcon from "../assets/icons/arrow.svg?react";
import BipodIcon from "../assets/icons/bipod.svg?react";
import PoleIcon from "../assets/icons/pole.svg?react";
import TripodIcon from "../assets/icons/tripod.svg?react";
import React, { useContext, useState } from "react";
import { Tool } from "./ToolbarItem";
import { RendererContext } from "../contexts/rendererContext";
const Toolbar = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;
  const [selectedTool, setSelectedTool] = useState("selectiontool");
  return (
    <nav className="toolbar">
      <p className="logo">SjorCRAFT</p>
      <div className="toolbar-icons">
        <Tool
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
      </div>
      <div className="profile"></div>
    </nav>
  );
};
export default Toolbar;
