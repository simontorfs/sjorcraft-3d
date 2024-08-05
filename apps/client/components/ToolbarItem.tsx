import React from "react";

export type ButtonType =
  | "selectiontool"
  | "poletool"
  | "bipodtool"
  | "tripodtool"
  | "polytool"
  | "lashingtool";
interface ToolbarItemProps {
  active?: boolean;
  disabled?: boolean;
  icon: React.FC2;
}
export const ToolbarItem: React.FC<ToolbarItemProps> = ({
  active,
  icon: Icon,
  disabled,
  className,
  ...props
}) => {
  return (
    <div {...props} className={active ? "toolbar-item-active" : "toolbar-item"}>
      <Icon />
    </div>
  );
};
