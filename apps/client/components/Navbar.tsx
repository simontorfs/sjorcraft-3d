import React from "react";
import NavButton from "./NavButton";
const Navbar = () => {
  return (
    <nav className="navbar">
      <p className="logo">SjorCRAFT</p>
      <div className="nav-buttons">
        <NavButton
          text="selectiontool"
          onClick={() =>
            window.dispatchEvent(new Event("activate_selectiontool"))
          }
        />
        <NavButton
          text="poletool"
          onClick={() => window.dispatchEvent(new Event("activate_poletool"))}
        />
        <NavButton
          text="bipodtool"
          onClick={() => window.dispatchEvent(new Event("activate_bipodtool"))}
        />
      </div>
      <div className="profile"></div>
    </nav>
  );
};
export default Navbar;
