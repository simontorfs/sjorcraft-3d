import React from "react";

export type ButtonType =
  | "selectiontool"
  | "poletool"
  | "bipodtool"
  | "tripodtool"
  | "polytool"
  | "lashingtool"
  | "destructiontool";
interface ToolbarItemProps {
  active?: boolean;
  disabled?: boolean;
  icon: React.FC2;
}
export const Tool: React.FC<ToolbarItemProps> = ({
  active,
  icon: Icon,
  disabled,
  className,
  ...props
}) => {
  return (
    <div {...props} className={active ? "toolbar-icon-active" : "toolbar-icon"}>
      <Icon />
    </div>
  );
};
