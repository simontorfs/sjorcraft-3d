import { Box } from "@mui/material";
import React from "react";

export type ButtonType =
  | "selectiontool"
  | "poletool"
  | "bipodtool"
  | "tripodtool"
  | "polypedestratool"
  | "lashingtool"
  | "destructiontool";
interface ToolbarItemProps {
  active?: boolean;
  disabled?: boolean;
  icon: string;
  onClick: () => void;
  style?: React.CSSProperties;
}
export const Tool: React.FC<ToolbarItemProps> = ({
  active,
  icon: Icon,
  disabled,
  ...props
}) => {
  return (
    <Box
      {...props}
      bgcolor={active ? "secondary.main" : "primary.main"}
      className={active ? "toolbar-icon-active" : "toolbar-icon"}
    >
      <Icon />
    </Box>
  );
};
