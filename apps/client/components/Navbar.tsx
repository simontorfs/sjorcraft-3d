import React from "react";
import NavButton from "./NavButton";
const Navbar = () => {
  return (
    <nav className="navbar">
      <p className="logo">SjorCRAFT</p>
      <div className="nav-buttons">
        <NavButton
          text="poletool"
          onClick={() => window.dispatchEvent(new Event("activate_poletool"))}
        />
      </div>
      <div className="profile"></div>
    </nav>
  );
};
export default Navbar;
