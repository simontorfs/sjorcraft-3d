import React from "react";
import PoleTable from "./PoleTable";
import CoffeeIcon from "../assets/icons/coffee.svg?react";
import { Box, Button, Divider, Tab, Tabs, Typography } from "@mui/material";
import ImportExportButtons from "./ImportExportButtons";
import InfoIcon from "@mui/icons-material/Info";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import TerrainIcon from "@mui/icons-material/Terrain";
import TerrainOptions from "./TerrainOptions";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`information-tabs-${index}`}
      aria-labelledby={`information-tabs-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `information-tabs-${index}`,
    "aria-controls": `information-tabs-${index}`,
  };
}

type EditorSidebarProps = {
  isSidebarOpen: boolean;
};
const EditorSidebar = ({ isSidebarOpen }: EditorSidebarProps) => {
  const [value, setValue] = React.useState(0);

  const onCoffeeBreak = () => {
    window.open(
      "https://buymeacoffee.com/sjorcraft",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        right: isSidebarOpen ? "0" : "-10rem",
        transition: "right 0.5s ease  0s  normal",
        height: "100%",

        zIndex: 10,
      }}
    >
      {isSidebarOpen && (
        <Box
          sx={{
            width: "30rem",
            right: "0",
            padding: "1rem",
            flexShrink: "0",
            boxShadow: "-3px 5px 8px 0px rgba(0,0,0,0.2)",
            overflow: "scroll",
            height: "100%",
            zIndex: 10,
          }}
          bgcolor="primary.light"
          color="primary.contrastText"
        >
          <Box
            sx={{ borderBottom: 1, borderColor: "divider" }}
            color="primary.contrastText"
          >
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Information Tabs"
              variant="fullWidth"
              indicatorColor="secondary"
              textColor="secondary"
            >
              <Tab
                icon={<InfoIcon />}
                label="Pole Info"
                {...a11yProps(0)}
                sx={{
                  color: "primary.contrastText",
                }}
              />
              <Tab
                icon={<ImportExportIcon />}
                label="Export and Import"
                {...a11yProps(1)}
                sx={{
                  color: "primary.contrastText",
                }}
              />
              <Tab
                icon={<TerrainIcon />}
                label="Terrain Options"
                {...a11yProps(2)}
                sx={{
                  color: "primary.contrastText",
                }}
              />
              <Tab
                icon={<CoffeeIcon />}
                label="Buy Us a Coffee"
                {...a11yProps(3)}
                sx={{
                  color: "primary.contrastText",
                }}
              />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <PoleTable />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <ImportExportButtons />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <TerrainOptions />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                alignContent: "center",
                alignSelf: "center",
                justifyContent: "center",
                justifyItems: "center",
                gap: "1rem",
              }}
            >
              <Typography variant="h6" color="primary.contrastText">
                Buy us a coffee
              </Typography>
              <Typography
                variant="body1"
                color="primary.contrastText"
                sx={{ textAlign: "center" }}
              >
                This project is free to use. If you like it, please consider
                buying us a coffee. It would help us a lot to keep this project
                up and running.
              </Typography>
              <Divider
                sx={{
                  width: "100%",
                  backgroundColor: "secondary.light",
                }}
              />
              <Button
                variant="contained"
                color="secondary"
                startIcon={<CoffeeIcon />}
                onClick={onCoffeeBreak}
              >
                Coffee break
              </Button>
            </Box>
          </CustomTabPanel>
        </Box>
      )}
    </Box>
  );
};

export default EditorSidebar;
