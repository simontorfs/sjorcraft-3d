import { Box } from "@mui/material";
import React from "react";

export type ButtonType =
  | "selectiontool"
  | "poletool"
  | "bipodtool"
  | "tripodtool"
  | "polytool"
  | "lashingtool";
type ToolbarItemProps = {
  active?: boolean;
  disabled?: boolean;
  icon: React.FC;
};
export const Tool: React.FC<ToolbarItemProps> = ({
  active,
  icon: Icon,
  disabled,
  ...props
}) => {
  return (
    <Box
      {...props}
      bgcolor={active ? "secondary.light" : "primary.light"}
      className={active ? "toolbar-icon-active" : "toolbar-icon"}
    >
      <Icon />
    </Box>
  );
};
