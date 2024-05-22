import React from "react";

export type ButtonType =
  | "selectiontool"
  | "poletool"
  | "bipodtool"
  | "tripodtool"
  | "polytool"
  | "lashingtool";

interface Props {
  text: ButtonType;
  onClick: () => void;
}
const NavButton = ({ text, onClick }: Props) => {
  return (
    <button className="nav-button" onClick={onClick}>
      {text}
    </button>
  );
};

export default NavButton;
