import React from "react";
import { useContext } from "react";
import PoleTable from "./PoleTable";
import ExportIcon from "../assets/icons/export.svg?react";
import ImportIcon from "../assets/icons/import.svg?react";
import CoffeeIcon from "../assets/icons/coffee.svg?react";
import { RendererContext } from "../contexts/rendererContext";
import { Box, Button, Divider, Icon, Stack, SvgIcon } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const EditorSidebar = () => {
  const rendererContext = useContext(RendererContext);
  const viewer = rendererContext.viewer;

  const onExportJpg = () => {
    viewer?.imageExporter.exportImage();
  };

  const onExportSjor = () => {
    viewer?.saveTool.exportAll("sjorcraft_export");
  };

  const onExportDae = () => {
    console.log("Exporting to dae");
  };

  const onImportSjor = () => {
    viewer?.saveTool.importAll();
  };

  const onCoffeeBreak = () => {
    window.open(
      "https://buymeacoffee.com/sjorcraft",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <Box
      sx={{
        backgroundColor: "#b7dfb2",
        color: "black",
        width: "15rem",
        right: "0",
        height: "100%",
        borderTop: "1px solid #6b7280",
        padding: "2rem",
        flexShrink: "0",
      }}
    >
      <PoleTable />
      <Divider color="gray" style={{ margin: "1rem 0rem" }} />
      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={onExportSjor}
        >
          .sjor
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={onExportJpg}
        >
          .jpg
        </Button>
        <Button
          sx={{ color: "primary.contrastText" }}
          variant="contained"
          disabled={true}
          startIcon={<FileDownloadIcon />}
          onClick={onExportDae}
        >
          .dae
        </Button>
      </Stack>
      <Divider color="gray" style={{ margin: "1rem 0rem" }} />
      <Stack>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileUploadIcon />}
          onClick={onImportSjor}
        >
          .sjor
        </Button>
      </Stack>
      <input type="file" id="file" accept=".sjor" style={{ display: "none" }} />
      <Divider color="gray" style={{ margin: "1rem 0rem" }} />
      <Stack>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CoffeeIcon />}
          onClick={onCoffeeBreak}
        >
          Coffee break
        </Button>
      </Stack>
    </Box>
  );
};

export default EditorSidebar;
