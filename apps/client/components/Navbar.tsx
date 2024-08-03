import React, { useContext } from "react";
import NavButton from "./NavButton";
import { RendererContext } from "../contexts/rendererContext";
const Navbar = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;
  return (
    <nav className="navbar">
      <p className="logo">SjorCRAFT</p>
      <div className="nav-buttons">
        <NavButton
          text="selectiontool"
          onClick={() => viewer?.inputHandler.onActivateTool("selectiontool")}
        />
        <NavButton
          text="poletool"
          onClick={() => viewer?.inputHandler.onActivateTool("poletool")}
        />
        <NavButton
          text="bipodtool"
          onClick={() => viewer?.inputHandler.onActivateTool("bipodtool")}
        />
        <NavButton
          text="tripodtool"
          onClick={() => viewer?.inputHandler.onActivateTool("tripodtool")}
        />
      </div>
      <div className="profile"></div>
    </nav>
  );
};
export default Navbar;
