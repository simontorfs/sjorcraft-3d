import ArrowIcon from "../assets/icons/arrow.svg?react";
import BipodIcon from "../assets/icons/bipod.svg?react";
import PoleIcon from "../assets/icons/pole.svg?react";
import TripodIcon from "../assets/icons/tripod.svg?react";
import React, { useContext, useState } from "react";
import { ToolbarItem } from "./ToolbarItem";
import { RendererContext } from "../contexts/rendererContext";
const Toolbar = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;
  const [selectedTool, setSelectedTool] = useState("selectiontool");
  return (
    <nav className="navbar">
      <p className="logo">SjorCRAFT</p>
      <div className="nav-buttons">
        <ToolbarItem
          active={selectedTool === "selectiontool"}
          disabled={false}
          icon={ArrowIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("selectiontool");
            setSelectedTool("selectiontool");
          }}
        />
        <ToolbarItem
          active={selectedTool === "poletool"}
          disabled={false}
          icon={PoleIcon} // TODO: replace with PoleIcon when we have one
          onClick={() => {
            viewer?.inputHandler.onActivateTool("poletool");
            setSelectedTool("poletool");
          }}
        />
        <ToolbarItem
          active={selectedTool === "bipodtool"}
          disabled={false}
          icon={BipodIcon}
          onClick={() => {
            viewer?.inputHandler.onActivateTool("bipodtool");
            setSelectedTool("bipodtool");
          }}
        />
      </div>
      <div className="profile"></div>
    </nav>
  );
};
export default Toolbar;
