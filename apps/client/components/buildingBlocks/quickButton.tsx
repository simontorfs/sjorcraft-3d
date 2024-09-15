import * as React from "react";
import { Box, SpeedDial, SpeedDialAction } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DisclaimerIcon from "@mui/icons-material/PrivacyTip";
import ResetLocalStoreIcon from "@mui/icons-material/Cached";
import ToolIcon from "@mui/icons-material/AutoFixHigh";
import { RendererContext } from "../../contexts/rendererContext";

type QuickButtonProps = {
  toggleDisclaimer: (open: boolean) => void;
};
const QuickButton = ({ toggleDisclaimer }: QuickButtonProps) => {
  const rendererContext = React.useContext(RendererContext);
  const { viewer } = rendererContext;
  const actions = [
    /* {
      icon: <SaveIcon />,
      name: "Save to Local Storage",
      action: () => {
        handleSaveToLocalStorage();
      },
    },
    {
      icon: <ResetLocalStoreIcon />,
      name: "Reset Local Storage",
      action: () => {
        viewer?.saveTool.clearLocalStorage();
      },
    },*/
    {
      icon: <DisclaimerIcon />,
      name: "Disclaimer",
      action: () => {
        toggleDisclaimer(true);
      },
    },
  ];

  const handleSaveToLocalStorage = () => {
    viewer?.saveTool.saveLashingsToLocalStorage();
    viewer?.saveTool.savePolesToLocalStorage();
  };

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: { xs: 40, md: 100 },
        right: 50,
        zIndex: 1000,
      }}
    >
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{}}
        icon={<ToolIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default QuickButton;
